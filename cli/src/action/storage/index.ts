import {
  bucketControllerCreate,
  bucketControllerFindAll,
  bucketControllerRemove,
  bucketControllerUpdate,
} from '../../api/v1/storage'
import * as Table from 'cli-table3'
import * as prompts from 'prompts'
import { CreateBucketDto, UpdateBucketDto } from '../../api/v1/data-contracts'
import { getEmoji } from '../../util/print'
import { getS3ClientV3 } from './s3'
import * as path from 'node:path'
import { ensureDirectory, readDirectoryRecursive, compareFileMD5, exist } from '../../util/file'
import * as fs from 'node:fs'
import * as mime from 'mime'
import { ListObjectsCommand, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Readable } from 'node:stream'
import { AppSchema } from '../../schema/app'

export async function list() {
  const appSchema = AppSchema.read()
  const buckets = await bucketControllerFindAll(appSchema.appid)
  const table = new Table({
    head: ['name', 'shortName', 'policy', 'updatedAt'],
  })
  for (const item of buckets) {
    table.push([item.name, item.shortName, item.policy, item.updatedAt])
  }
  console.log(table.toString())
}

const policySelect = {
  type: 'select',
  name: 'policy',
  message: 'please select policy',
  choices: [
    { title: 'private', value: 'private' },
    { title: 'readonly', value: 'readonly' },
    { title: 'readwrite', value: 'readwrite' },
  ],
}

export async function create(bucketName, options: { policy: string }) {
  const appSchema = AppSchema.read()
  let policy = options.policy
  if (!policy) {
    console.log('please select bucket storage policy')
    const policyResult = await prompts(policySelect)
    policy = policyResult.policy
  }
  const bucketDto: CreateBucketDto = {
    shortName: bucketName,
    policy: policy as any,
  }

  await bucketControllerCreate(appSchema.appid, bucketDto)
  console.log(`${getEmoji('✅')} bucket ${bucketName} created`)
}

export async function update(bucketName, options: { policy: string }) {
  const appSchema = AppSchema.read()
  let policy = options.policy
  if (!policy) {
    console.log('please select the storage policy to be replaced')
    const policyResult = await prompts(policySelect)
    policy = policyResult.policy
  }

  const bucketDto: UpdateBucketDto = {
    policy: policy as any,
  }
  await bucketControllerUpdate(appSchema.appid, bucketName, bucketDto)
  console.log(`${getEmoji('✅')} bucket ${bucketName} updated`)
}

export async function del(bucketName, options) {
  if (options) {
  }
  const appSchema = AppSchema.read()
  await bucketControllerRemove(appSchema.appid, bucketName)
  console.log(`${getEmoji('✅')} bucket ${bucketName} deleted`)
}

export async function pull(bucketName: string, outPath: string, options: { force: boolean; detail: boolean }) {
  const appSchema = AppSchema.read()
  const client = getS3ClientV3(appSchema.storage)
  const listCommand = new ListObjectsCommand({
    Bucket: bucketName,
    Delimiter: '',
  })
  const res = await client.send(listCommand)
  const bucketObjects = res.Contents || []

  const absPath = path.resolve(outPath)
  ensureDirectory(absPath)

  // get local files
  const localFiles = readDirectoryRecursive(absPath).map((file) => {
    return {
      key: path.relative(absPath, file).replace(/\\/g, '/'),
      absPath: path.resolve(file),
    }
  })

  // get need download files
  const downloadFiles = getDownloadFiles(localFiles, bucketObjects)

  // download files
  if (downloadFiles?.length > 0) {
    downloadFiles.forEach(async (item) => {
      const index = item.Key.lastIndexOf('/')
      if (index > 0) {
        const newDir = item.Key.substring(0, index)
        const newPath = path.resolve(absPath, newDir)
        ensureDirectory(newPath)
      }

      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: item.Key,
      })
      const obj = await client.send(getCommand)
      const filepath = path.resolve(absPath, item.Key)
      const readableStream: Readable = obj.Body as Readable
      if (options.detail) {
        console.log(`${getEmoji('📥')} download file: ${filepath}`)
      }
      const writer = fs.createWriteStream(filepath)
      readableStream.pipe(writer)
    })
  }
}

export async function push(bucketName: string, inPath: string, options: { force: boolean; detail: boolean }) {
  const appSchema = AppSchema.read()

  const client = getS3ClientV3(appSchema.storage)
  const listCommand = new ListObjectsCommand({
    Bucket: bucketName,
    Delimiter: '',
  })
  const res = await client.send(listCommand)
  const bucketObjects = res.Contents || []

  const absPath = path.resolve(inPath)
  if (!exist(absPath)) {
    console.log(`${getEmoji('❌')} ${absPath} not exist`)
    process.exit(1)
  }

  // get local files
  const localFiles = readDirectoryRecursive(absPath).map((file) => {
    return {
      key: path.relative(absPath, file).replace(/\\/g, '/'),
      absPath: path.resolve(file),
    }
  })

  // get need upload files
  const uploadFiles = getUploadFiles(localFiles, bucketObjects)
  console.log(`${getEmoji('📤')} upload files: ${uploadFiles.length}`)
  if (uploadFiles?.length > 0) {
    for (const file of uploadFiles) {
      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: file.key,
        Body: fs.readFileSync(path.resolve(absPath, file.absPath)),
        ContentType: mime.getType(file.key),
      })
      await client.send(putCommand)

      if (options.detail) {
        console.log(`${getEmoji('📤')} upload file: ${file.absPath}`)
      }
    }
  }

  const deletesFiles = getDeletedFiles(localFiles, bucketObjects)
  if (deletesFiles?.length > 0) {
    console.log(`${getEmoji('📤')} delete files: ${deletesFiles.length}`)
    for (const file of deletesFiles) {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: file.Key,
      })
      await client.send(deleteCommand)

      if (options.detail) {
        console.log(`${getEmoji('📤')} delete file: ${file.Key}`)
      }
    }
  }
}

// get download files
function getDownloadFiles(sourceFiles: { key: string; absPath: string }[], bucketObjects: any) {
  const downloadFiles = bucketObjects.filter((bucketObject) => {
    const sourceFile = sourceFiles.find((sourceFile) => bucketObject.Key === sourceFile.key)
    if (!sourceFile) {
      return true
    }
    return !compareFileMD5(sourceFile.absPath, bucketObject)
  })
  return downloadFiles
}

// get upload files
function getUploadFiles(sourceFiles: { key: string; absPath: string }[], bucketObjects: any) {
  const uploadFiles = sourceFiles.filter((sourceFile) => {
    const bucketObject = bucketObjects.find((bucketObject) => bucketObject.Key === sourceFile.key)
    if (!bucketObject) {
      return true
    }
    return !compareFileMD5(sourceFile.absPath, bucketObject)
  })
  return uploadFiles
}

// get deleted files
function getDeletedFiles(sourceFiles: { key: string; absPath: string }[], bucketObjects: any[]) {
  const deletedFiles = bucketObjects.filter((bucketObject) => {
    const key = bucketObject.Key
    return !sourceFiles.find((sourceFile) => sourceFile.key === key)
  })
  return deletedFiles
}

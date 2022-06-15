import { S3 } from '@aws-sdk/client-s3'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { createHash } from 'node:crypto'
import * as mime from 'mime'


export async function handleSyncCommand(source: string, options: {
  endpoint: string, accessKey: string, accessSecret: string, region: string,
  bucketName: string, dryRun: boolean, force: boolean
}) {
  const s3 = getS3Client(options.endpoint, options.accessKey, options.accessSecret, options.region)

  // get bucket objects
  const res = await s3.listObjectsV2({ Bucket: options.bucketName, Delimiter: '' })
  const bucketObjects = res.Contents || []

  // get source files
  const abs_source = path.resolve(source)
  const sourceFiles = readdirRecursive(source)
    .map(file => {
      return {
        key: path.relative(abs_source, file),
        abs_path: path.resolve(file),
      }
    })


  // get updated files
  let  updatedFiles = sourceFiles
  if(!options.force) {
    updatedFiles = getUpdatedFiles(sourceFiles, bucketObjects)
  }
  
  console.log(`${updatedFiles.length} files need to be updated`)

  for (const file of updatedFiles) {
    console.log(`uploading ${file.key} with: ${mime.getType(file.key)}`)
    if (!options.dryRun) {
      await s3.putObject({
        Bucket: options.bucketName,
        Key: file.key,
        Body: fs.readFileSync(path.resolve(source, file.abs_path)),
        ContentType: mime.getType(file.key)
      })
    }
  }

  // get deleted files
  const deletedFiles = getDeletedFiles(sourceFiles, bucketObjects)
  if(deletedFiles?.length > 0) {
    console.log(`${deletedFiles.length} files need to be deleted`)
    for (const obj of deletedFiles) {
      console.log(`deleting ${obj.Key}`)
      if (!options.dryRun) {
        await s3.deleteObject({ Bucket: options.bucketName, Key: obj.Key })
      }
    }
  }
}



// readdir recursive
function readdirRecursive(dir: string) {
  const files = fs.readdirSync(dir)
  const result = []
  for (const file of files) {
    const filepath = path.join(dir, file)
    const stats = fs.statSync(filepath)
    if (stats.isDirectory()) {
      result.push(...readdirRecursive(filepath))
    } else {
      result.push(filepath)
    }
  }
  return result
}

// get deleted files which are not in source files
function getDeletedFiles(sourceFiles: { key: string, abs_path: string }[], bucketObjects: any[]) {
  const deletedFiles = bucketObjects.filter(bucketObject => {
    const key = bucketObject.Key
    return !sourceFiles.find(sourceFile => sourceFile.key === key)
  }
  )
  return deletedFiles
}

// get updated files
function getUpdatedFiles(sourceFiles: { key: string, abs_path: string }[], bucketObjects: any[]) {
  const updatedFiles = sourceFiles.filter(sourceFile => {
    const bucketObject = bucketObjects.find(bucketObject => bucketObject.Key === sourceFile.key)
    if (!bucketObject) {
      return true
    }
    return !compareFileMd5(sourceFile.abs_path, bucketObject)
  })

  return updatedFiles
}

// compare file md5
function compareFileMd5(sourceFile: string, bucketObject: any) {
  const source_data = fs.readFileSync(sourceFile)
  const source_file_md5 = createHash('md5').update(source_data).digest('hex')
  const etag = bucketObject.ETag.replace(/\"/g, '')
  return source_file_md5 === etag
}

/**
 * get s3 client
 * @param endpoint 
 * @param accessKey 
 * @param accessSecret 
 * @param region 
 * @returns 
 */
function getS3Client(endpoint: string, accessKey: string, accessSecret: string, region: string) {
  const s3 = new S3({
    endpoint,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: accessSecret
    },
    forcePathStyle: true,
    region
  })

  return s3
}

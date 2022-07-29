import * as fs from 'node:fs'
import * as path from 'node:path'
import { createHash } from 'node:crypto'
import * as mime from 'mime'
import axios from 'axios'
import { pipeline } from 'node:stream/promises'
import { ensureDirectory, getS3Client } from '../utils/util'

/**
 * push files
 * @param {object} credentials
 * @param {object} options
 * @returns
 */
export async function handlePushCommand(credentials: any, options: any) {
    const s3 = getS3Client(options.endpoint, credentials)
    const source = options.source

    // get bucket objects
    const res = await s3.listObjectsV2({ Bucket: options.bucketName, Delimiter: '' }).promise()

    // console.log(res.Contents)
    const bucketObjects = res.Contents || []

    const abs_source = path.resolve(source)
    if (!fs.existsSync(abs_source)) {
        console.error('source not exist')
        process.exit(1)
    }

    // get source files
    const sourceFiles = readdirRecursive(source).map(file => {
        return {
            key: path.relative(abs_source, file).split(path.sep).join('/'),
            abs_path: path.resolve(file),
        }
    })

    // get updated files
    const updatedFiles = getUpdatedFiles(sourceFiles, bucketObjects)

    console.log(`${updatedFiles.length} files need to be updated`)

    for (const file of updatedFiles) {
        console.log(`uploading ${file.key} with: ${mime.getType(file.key)}`)
        if (!options.dryRun) {
            await s3.putObject({
                Bucket: options.bucketName,
                Key: file.key,
                Body: fs.readFileSync(path.resolve(source, file.abs_path)),
                ContentType: mime.getType(file.key),
            }).promise()

            console.log(path.resolve(source, file.abs_path))
        }
    }

    // get deleted files 
    const deletedFiles = getDeletedFiles(sourceFiles, bucketObjects)
    if (deletedFiles?.length > 0) {
        if (options.forceOverwrite) {
            console.log(`${deletedFiles.length} files need to be deleted`)
            for (const obj of deletedFiles) {
                console.log(`deleting ${obj.Key}`)
                if (!options.dryRun) {
                    await s3.deleteObject({ Bucket: options.bucketName, Key: obj.Key }).promise()
                }
            }
        }
    }
}


/**
 * pull files
 * @param {object} credentials
 * @param {object} options
 * @returns
 */

export async function handlePullCommand(credentials: any, options: any) {

    const s3 = getS3Client(options.endpoint, credentials)

    const outPath = options.outPath

    // get bucket objects
    const res = await s3.listObjectsV2({ Bucket: options.bucketName, Delimiter: '' }).promise()
    const bucketObjects = res.Contents || []

    // get local files
    const abs_source = path.resolve(outPath)
    ensureDirectory(abs_source)
    const localFiles = readdirRecursive(outPath)
        .map(file => {
            return {
                key: path.relative(abs_source, file),
                abs_path: path.resolve(file),
            }
        })

    // get download files
    const downFiles = getDownFiles(localFiles, bucketObjects)

    if (downFiles?.length > 0) {

        downFiles.forEach(async item => {

            const fileurl = s3.getSignedUrl('getObject', { Bucket: options.bucketName, Key: item.Key })
            const index = item.Key.lastIndexOf("/")

            if (index > 0) {
                const newDir = item.Key.substring(0, index)
                const newPath = path.resolve(abs_source, newDir)
                ensureDirectory(newPath)
            }

            const data = await axios({ url: fileurl, method: 'GET', responseType: 'stream' })

            const filepath = path.resolve(abs_source, item.Key)

            const writer = fs.createWriteStream(filepath)

            await pipeline(data.data, writer)
        })

    }

    // get deleted files 
    const deletedFiles = getLocalDeletedFiles(localFiles, bucketObjects)
    console.log(deletedFiles)
    if (deletedFiles?.length > 0) {
        if (options.forceOverwrite) {
            console.log(`${deletedFiles.length} files need to be deleted`)
            for (const obj of deletedFiles) {
                console.log(`deleting ${obj.key}`)
                fs.unlinkSync(obj.abs_path)
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
    })
    return deletedFiles
}


// get deleted files which are not in bucketObjects 
function getLocalDeletedFiles(sourceFiles: any, bucketObjects: any) {

    const deletedFiles = sourceFiles.filter(sourceFile => {
        const key = sourceFile.key
        return !bucketObjects.find(bucketObject => bucketObject.Key === key)
    })
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

// get down files
function getDownFiles(sourceFiles: any, bucketObjects: any) {

    const downFiles = bucketObjects.filter(bucketObject => {
        const sourceFile = sourceFiles.find(sourceFile => bucketObject.Key === sourceFile.key)
        if (!sourceFile) {
            return true
        }
        return !compareFileMd5(sourceFile.abs_path, bucketObject)
    })

    return downFiles

}

// compare file md5
function compareFileMd5(sourceFile: string, bucketObject: any) {

    const source_data = fs.readFileSync(sourceFile)
    const source_file_md5 = createHash('md5').update(source_data).digest('hex')
    const etag = bucketObject.ETag.replace(/\"/g, '')
    return source_file_md5 === etag
}
import path = require("path")
import { DatabaseAgent } from "../lib/database"
import * as assert from 'assert'
import { FileItemType } from "../lib/types"
import { Constants } from "../constants"
import { GridFSStorage } from "../lib/gridfs-storage"

/**
 * Get file by its name
 * @param bucket 
 * @param filename 
 * @returns 
 */
export async function getFileByName(bucket: string, filename: string) {
  assert.ok(bucket, 'empty bucket got')
  assert.ok(filename, 'empty filename got')

  const coll = DatabaseAgent.db.collection<FileItemType>(bucket + ".files")
  const file = await coll.findOne({ filename })
  return file
}

/**
 * Get files in directory
 * @param bucket 
 * @param parent 
 * @returns 
 */
export async function getFilesInDirectory(bucket: string, parent: string, offset?: number, limit?: number) {
  assert.ok(bucket, 'empty bucket got')
  assert.ok(parent, 'empty parent got')

  const options = {
    skip: offset ?? 0,
    limit: limit ?? Infinity
  }

  const coll = DatabaseAgent.db.collection<FileItemType>(bucket + ".files")
  const files = await coll.find({ "metadata.parent": parent }, options).toArray()
  return files
}


/**
 * Count files in directory
 * @param bucket 
 * @param parent 
 * @returns 
 */
export async function countFilesInDirectory(bucket: string, filepath: string) {
  assert.ok(bucket, 'empty bucket got')
  assert.ok(filepath, 'empty filepath got')

  const coll = DatabaseAgent.db.collection(bucket + ".files")
  const count = await coll.countDocuments({ "metadata.parent": filepath })
  return count
}

/**
 * Check if a path exists
 * @param bucket 
 * @param path 
 * @returns 
 */
export async function pathExists(bucket: string, path: string) {
  assert.ok(bucket, 'empty bucket got')
  assert.ok(path, 'empty path got')

  const coll = DatabaseAgent.db.collection(bucket + ".files")
  const count = await coll.countDocuments({ filename: path })
  return count > 0 ? true : false
}

/**
 * Create a directory in bucket
 * @param {string} bucket bucket name
 * @param {string} parent the parent directory name
 * @param {string} name directory name to be created
 * @param {boolean} isRoot if directory wanted to created is root directory
 * @returns
 */
export async function mkdir(bucket: string, parent: string, name: string) {
  assert.ok(bucket, 'empty bucket got')
  assert.ok(parent || parent === '', 'empty parent got')
  assert.ok(name, 'empty name got')

  const coll = DatabaseAgent.db.collection(bucket + ".files")
  const doc: FileItemType = {
    filename: path.join(parent, name),
    uploadDate: new Date(),
    length: 0,
    metadata: {
      contentType: Constants.DIRECTORY_MIME_TYPE,
      parent,
      name,
    },
  }
  const r = await coll.insertOne(doc)
  return r.insertedId
}

export async function deleteFile(bucket: string, filename: string) {
  assert.ok(bucket, 'empty bucket got')
  assert.ok(filename, 'empty filename got')

  const storage = new GridFSStorage(bucket, DatabaseAgent.db)
  const r = await storage.delete(filename)
  return r
}

export async function deleteDirectory(bucket: string, filename: string) {
  assert.ok(bucket, 'empty bucket got')
  assert.ok(filename, 'empty filename got')

  const coll = DatabaseAgent.db.collection(bucket + ".files")
  const r = await coll.deleteOne({ filename })
  return r.deletedCount ? true : false
}
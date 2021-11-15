import * as assert from "assert"
import { Constants } from "../constants"
import { DatabaseAgent } from "../lib/database"
import { BucketMode, BucketType, FileItemType } from "../lib/types"

/**
 * get a bucket by name
 * @param name 
 * @returns 
 */
export async function getBucketByName(name: string) {
  assert.ok(name, 'empty bucket name got')

  const coll = DatabaseAgent.db.collection(Constants.cn.BUCKETS)
  const bucket = await coll.findOne<BucketType>({ name })

  return bucket
}

/**
 * Create a bucket
 * @param bucket 
 * @returns 
 */
export async function createBucket(bucket: BucketType) {
  assert.ok(bucket, 'empty bucket got')
  assert.ok(bucket.mode !== undefined, 'empty bucket mode got')
  assert.ok(bucket.name, 'empty bucket name got')

  const coll = DatabaseAgent.db.collection(Constants.cn.BUCKETS)
  const r = await coll.insertOne(bucket)

  return r.insertedId
}

/**
 * Delete a bucket
 * @param name 
 * @returns 
 */
export async function deleteBucketByName(name: string) {
  assert.ok(name, 'empty bucket name got')

  const c_files = name + '.files'
  const c_chunks = name + '.chunks'

  const db = DatabaseAgent.db
  const files_coll = await db.listCollections({ name: c_files }).toArray()
  if (files_coll?.length) {
    await db.collection(c_files).drop()
  }

  const chunks_coll = await db.listCollections({ name: c_chunks }).toArray()
  if (chunks_coll?.length) {
    await db.collection(c_chunks).drop()
  }

  const coll = db.collection(Constants.cn.BUCKETS)
  const r = await coll.deleteOne({ name })
  return r.deletedCount > 0 ? true : false
}

/**
 * Update a bucket by name
 * @param name 
 * @param mode 
 * @param secret 
 * @returns 
 */
export async function updateBucketByName(name: string, mode: BucketMode, secret: string) {
  assert.ok(name, 'empty name got')
  assert.ok(mode !== undefined, 'empty mode got')

  const data = {
    mode,
    updated_at: Date.now()
  }
  if (secret) {
    data['secret'] = secret
  }

  const coll = DatabaseAgent.db.collection<BucketType>(Constants.cn.BUCKETS)
  const r = await coll.updateOne(
    { name },
    { $set: data }
  )

  return r.matchedCount > 0 ? true : false
}

/**
 * Create bucket collections and indexes: [bucket].files, [bucket].chunks
 * @param bucket bucket name
 */
export async function createBucketCollections(bucket: string) {
  assert.ok(bucket, 'empty bucket got')

  const db = DatabaseAgent.db
  await db.createCollection(bucket + ".files")
  await db.createCollection(bucket + ".chunks")

  await db.collection(bucket + ".files").createIndexes([
    {
      key: { filename: 1, uploadDate: 1 },
      unique: true
    },
    { key: { 'metadata.parent': 1 } }
  ])

  await db.collection(bucket + ".chunks").createIndexes([
    {
      key: { files_id: 1, n: 1 },
      unique: true
    }
  ])
}

/**
 * Create the root path for a bucket
 * @param {string} bucket bucket name
 * @param {string} parent the parent directory name
 * @param {string} name directory name to be created
 * @param {boolean} isRoot if directory wanted to created is root directory
 * @returns
 */
export async function createBucketRootPath(bucket: string) {
  assert.ok(bucket, 'empty bucket got')

  const coll = DatabaseAgent.db.collection(bucket + ".files")
  const doc: FileItemType = {
    filename: '/',
    uploadDate: new Date(),
    length: 0,
    metadata: {
      contentType: Constants.DIRECTORY_MIME_TYPE,
      parent: '',
      name: '/',
    },
  }

  const r = await coll.insertOne(doc)
  return r.insertedId
}
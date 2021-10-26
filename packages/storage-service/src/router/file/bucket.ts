import * as express from "express"
import { Constants } from "../../constants"
import { DatabaseAgent } from "../../lib/database"
import { mkdir } from "../../lib/mkdir"

const bucket_collection_name = Constants.cn.BUCKET_INFO_COLLECTION_NAME

/**
 * create a bucket in specified application
 * @param {string} bucket_name bucket name need to create
 * @param {string} mode 'public' or 'private'
 * @param {Object} options some create options, currently empty
 */
export async function handleCreateBucket(
  req: express.Request,
  res: express.Response
) {
  // check given params
  const { bucket_name, mode = "public", options = {} } = req.body
  if (!bucket_name || !mode) {
    return res.status(400).send("missing params")
  }
  const coll = DatabaseAgent.db.collection(bucket_collection_name)
  try {
    // check bucket name if already exists
    const doc = await coll.findOne({ bucket_name })
    if (doc) {
      return res.status(401).send("bucket already exists")
    }
    // construct bucket structure
    const new_bucket = {
      bucket_name,
      mode,
      options,
      created_at: Date.now(),
      updated_at: Date.now(),
    }
    // save into database
    const insert_result = await coll.insertOne(new_bucket)
    // created root directory at same time
    await mkdir(bucket_name, "", "/", true)
    return res.status(200).send(insert_result)
  } catch (error) {
    return res.status(500).send("internal server error")
  }
}

/**
 * delete a bucket in specified application
 * @param {string} appid delete bucket in which application
 * @param {string} bucket_name bucket name need to delete
 */
export async function handleDeleteBucket(
  req: express.Request,
  res: express.Response
) {
  // check given params
  const { bucket_name } = req.body
  if (!bucket_name) {
    return res.status(400).send("missing params")
  }
  const coll = DatabaseAgent.db.collection(bucket_collection_name)
  try {
    // check if bucket exists
    const doc = await coll.findOne({ bucket_name })
    if (!doc) {
      return res.status(401).send("bucket doesn't exist")
    }
    // @todo check if bucket empty
    // delete this bucket
    const r = await coll.deleteOne({ bucket_name })
    return res.status(200).send(r)
  } catch (error) {
    return res.status(500).send("internal server error")
  }
}

/**
 * update a bucket in specified application
 * @param {string} appid delete bucket in which application
 * @param {string} bucket_name bucket name need to update
 */
export async function handleUpdateBucket(
  req: express.Request,
  res: express.Response
) {
  // check given params
  const { bucket_id, bucket_name, mode, options = {} } = req.body
  if (!bucket_id) {
    return res.status(400).send("missing bucket_id")
  }
  const coll = DatabaseAgent.db.collection(bucket_collection_name)
  try {
    // update this bucket
    const r = await coll.findOneAndUpdate(
      { _id: bucket_id },
      { $set: { bucket_name, mode, options, updated_at: Date.now() } }
    )
    return res.status(200).send(r)
  } catch (error) {
    console.log(error)
    return res.status(500).send("internal server error")
  }
}

/**
 * list all buckets in specified application
 */
/**
 * list all buckets in specified application
 * @param {string} appid delete bucket in which application
 */
export async function handleGetBucket(
  req: express.Request,
  res: express.Response
) {
  // check given params
  const { bucket } = req.body
  if (!bucket) {
    return res.status(400).send("missing bucket name")
  }
  const coll = DatabaseAgent.db.collection(bucket_collection_name)
  try {
    // check if bucket exists
    const doc = await coll.findOne({ bucket })
    return res.status(200).send({ code: 0, doc })
  } catch (error) {
    return res.status(500).send("internal server error")
  }
}

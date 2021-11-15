import * as express from "express"
import { createBucket, createBucketCollections, createBucketRootPath, getBucketByName } from "../../api/bucket"
import { logger } from "../../lib/logger"
import { BucketMode, BucketType } from "../../lib/types"


/**
 * create a bucket
 * @body {string} bucket_name bucket name need to create
 * @body {string} mode can be: 'public-read' | 'public-read-write' | 'private'
 * @options {Object} options some create options, currently empty
 */
export async function handleCreateBucket(req: express.Request, res: express.Response) {

  // check given params
  const { name, mode = BucketMode.PRIVATE, secret } = req.body
  if (!name) return res.status(400).send("missing bucket name")
  if (!secret) return res.status(400).send("missing bucket secret")

  try {
    // check bucket name if already exists
    if (await getBucketByName(name)) {
      return res.status(400).send("bucket already exists")
    }

    // construct bucket structure
    const data: BucketType = {
      name,
      mode,
      secret,
      created_at: Date.now(),
      updated_at: Date.now(),
    }

    // save into database
    const insertedId = await createBucket(data)

    // create bucket collections
    await createBucketCollections(name)

    // created root directory
    await createBucketRootPath(name)

    return res.status(200).send({
      code: 0,
      data: insertedId.toHexString()
    })
  } catch (error) {
    logger.error('create bucket failed: ', error)
    return res.status(500).send("internal server error")
  }
}

import * as express from "express"
import { updateBucketByName } from "../../api/bucket"
import { logger } from "../../lib/logger"

/**
 * update a bucket by name
 * @param {string} appid delete bucket in which application
 * @param {string} bucket_name bucket name need to update
 */
export async function handleUpdateBucket(req: express.Request, res: express.Response) {
  const name = req.params.name
  const { mode, secret } = req.body

  try {
    const r = await updateBucketByName(name, mode, secret)
    return res.status(200).send({
      code: 0,
      data: r
    })
  } catch (error) {
    logger.error('update bucket failed: ', error)
    return res.status(500).send("internal server error")
  }
}

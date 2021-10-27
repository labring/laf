import * as express from "express"
import { getBucketByName } from "../../api/bucket"
import { logger } from "../../lib/logger"

/**
 * Get a bucket's detail by it's name
 */
export async function handleGetBucket(req: express.Request, res: express.Response) {

  // check given params
  const name = req.params.name
  if (!name) {
    return res.status(400).send("missing bucket name")
  }

  try {
    const bucket = await getBucketByName(name)
    return res.status(200).send({ code: 0, bucket })
  } catch (error) {
    logger.error('get bucket failed: ', error)
    return res.status(500).send("internal server error")
  }
}

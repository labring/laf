import * as express from "express"
import { deleteBucketByName, getBucketByName } from "../../api/bucket"
import { countFilesInDirectory } from "../../api/file"
import { logger } from "../../lib/logger"

/**
 * delete a bucket in specified application
 * @param {string} appid delete bucket in which application
 * @param {string} bucket_name bucket name need to delete
 */
export async function handleDeleteBucket(req: express.Request, res: express.Response) {
  // check given params
  const { name } = req.params
  if (!name) {
    return res.status(400).send("missing bucket name")
  }

  try {
    // check if bucket exists
    const bucket = await getBucketByName(name)
    if (!bucket) {
      return res.status(200).send({ code: 'NOT_EXISTS', error: "bucket doesn't exist" })
    }

    // check if bucket empty
    const fileCount = await countFilesInDirectory(name, '/')
    if (fileCount > 0) {
      return res.send({
        code: 'BUCKET_NOT_EMPTY',
        error: 'cannot delete none-empty-bucket'
      })
    }

    // delete this bucket
    const r = await deleteBucketByName(name)
    return res.send({
      code: 0,
      data: r
    })
  } catch (error) {
    logger.error('delete bucket failed: ', error)
    return res.status(500).send("internal server error")
  }
}


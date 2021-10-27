import * as express from "express"
import { handleCreateBucket } from "./create"
import { handleDeleteBucket } from "./delete"
import { handleGetBucket } from "./get"
import { handleUpdateBucket } from "./update"

export const BucketRouter = express.Router()

/**
 * create a bucket
 */
BucketRouter.post("/buckets", handleCreateBucket)

/**
 * delete a bucket
 */
BucketRouter.delete("/buckets/:name", handleDeleteBucket)

/**
 * update a bucket
 */
BucketRouter.put("/buckets/:name", handleUpdateBucket)

/**
 * get a bucket
 */
BucketRouter.get("/buckets/:name", handleGetBucket)

import * as express from "express"
import * as multer from "multer"
import {
  handleCreateBucket,
  handleDeleteBucket,
  handleGetBucket,
  handleUpdateBucket,
} from "./bucket"
import { handleUploadFile, handleMakeDir } from "./upload"
import { handleGetFile } from "./download"

export const FileRouter = express.Router()

/**
 * Creates the multer uploader
 */
const storage = multer.diskStorage({
  filename: (_req, file, cb) => {
    cb(null, file.originalname)
  },
})
const uploader = multer({ storage })

/**
 * application create bucket
 */
FileRouter.post("/create-bucket", handleCreateBucket)

/**
 * application delete bucket
 */
FileRouter.post("/delete-bucket", handleDeleteBucket)

/**
 * application update bucket information
 */
FileRouter.post("/update-bucket", handleUpdateBucket)

/**
 * list all application buckets
 */
FileRouter.get("/get-bucket", handleGetBucket)

/**
 * upload file into a specified bucket
 */
FileRouter.post("/upload/:bucket", uploader.single("file"), handleUploadFile)

/**
 * delete a file by filepath in a specified bucket
 */
FileRouter.post("/delete-file/:bucket")

/**
 * make directory doc into a specified bucket
 */
FileRouter.post("/mkdir/:bucket", handleMakeDir)

/**
 * delete directory by dirpath in a specified bucket
 */
FileRouter.post("/delete-dir/:bucket")

/**
 * read a filepath
 */
FileRouter.get("/:bucket", handleGetFile)

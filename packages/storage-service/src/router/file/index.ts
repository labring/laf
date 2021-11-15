import * as express from "express"
import * as multer from "multer"
import { handleUploadFile } from "./upload"
import { handleGetFile } from "./get"
import { handleMakeDir } from "./mkdir"
import { handleDeleteFile } from "./delete"
import { generateUUID } from "../../lib/utils"
import path = require("path")

export const FileRouter = express.Router()

/**
 * Creates the multer uploader
 */
const storage = multer.diskStorage({
  filename: (_req, file, cb) => {
    const { ext } = path.parse(file.originalname)
    cb(null, generateUUID() + ext)
  },
})
const uploader = multer({ storage })

/**
 * Upload file into a specified bucket
 */
FileRouter.post("/:bucket", uploader.single("file"), handleUploadFile)

/**
 * Read a filepath
 */
FileRouter.get("/:bucket", handleGetFile)

/**
 * Delete a file/directory by filepath in a specified bucket
 */
FileRouter.delete("/:bucket", handleDeleteFile)

/**
 * Make directory into a specified bucket
 */
FileRouter.post("/:bucket/dir", handleMakeDir)

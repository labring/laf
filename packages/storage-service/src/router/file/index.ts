import * as express from "express"
import * as multer from "multer"
import { handleUploadFile } from "./upload"
import { handleGetFile } from "./get"
import { handleMakeDir } from "./mkdir"
import { handleDeleteFile } from "./delete"

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

/******** Classic Style Route *********/
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
FileRouter.post("/delete-dir/:bucket", handleDeleteFile)

/**
 * read a filepath
 */
FileRouter.get("/:bucket", handleGetFile)



/********** REST Style Route  *********/

/**
 * Upload file into a specified bucket
 */
FileRouter.post("/:bucket/files", uploader.single("file"), handleUploadFile)

/**
 * Read a filepath
 */
FileRouter.get("/:bucket/files", handleGetFile)

/**
 * Make directory into a specified bucket
 */
FileRouter.post("/:bucket/dir", handleMakeDir)

/**
 * Delete a file/directory by filepath in a specified bucket
 */
FileRouter.delete("/:bucket/files", handleDeleteFile)

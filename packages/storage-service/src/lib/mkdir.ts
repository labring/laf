import * as path from "path"
import { DatabaseAgent } from "./database"

/**
 *
 * @param {string} bucket bucket name
 * @param {string} dirname directory parent name
 * @param {string} filename directory name
 * @param {boolean} isRoot if directory wanted to created is root directory
 * @returns {object} if make success, eg. success: code equals 0, otherwise non-zero value
 */
export async function mkdir(
  bucket: string,
  dirname: string,
  filename: string,
  isRoot = false
) {
  const coll = DatabaseAgent.db.collection(bucket + ".files")
  if (isRoot) {
    return await coll.insertOne({
      filename: "/",
      metadata: {
        type: "dir",
        dirname: "",
        filename: "/",
      },
    })
  }
  const dir_doc = {
    filename: path.join(dirname as string, filename as string), // full path, correspond with file type
    metadata: {
      type: "dir",
      dirname, // directory parent name
      filename, // directory true name
    },
  }
  return await coll.insertOne(dir_doc)
}

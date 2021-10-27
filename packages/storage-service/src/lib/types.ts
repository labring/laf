import { ObjectId } from "bson"


export enum BucketMode {
  PRIVATE = 0,
  PUBLIC_READ = 1,
  PUBLIC_READ_WRITE = 2
}

export interface BucketType {
  _id?: ObjectId
  name: string
  mode: BucketMode
  secret: string
  created_at: number
  updated_at: number
}

export interface FileItemType {
  _id?: ObjectId

  /**
   * The full path of file/directory, for example:
   * - `/images`
   * - `/images/test.png`
   * - `/`
   */
  filename: string

  uploadDate?: Date

  length?: number

  metadata: FileItemMeta
}

export interface FileItemMeta {
  /**
   * The mimetype of file, except the `application/x-directory` which defined as directory type in this service 
   */
  contentType?: string

  /**
   * the parent path of file/directory
   */
  parent: string

  /**
   * the real name of file/directory:
   * - `images`
   * - `test.png`
   */
  name: string
}
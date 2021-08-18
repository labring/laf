/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-19 01:25:55
 * @Description: 
 */

import { ReadStream } from "fs"

export interface FileInfo {
  /**
   * The file id, only valid for `gridfs`
   */
  id?: string

  /**
   * The file name
   */
  filename: string,

  /**
   * The size of file in bytes
   */
  size: number

  /**
   * The relative path of file
   */
  path: string

  /**
   * The absolute path of file, only valid for `localfs`
   */
  fullpath?: string

  /**
   * The original name of the file
   */
  original_name?: string

  /**
   * The bucket name of file
   */
  bucket: string

  /**
   * The content type of file, only valid for `gridfs`
   */
  contentType?: string

  /**
   * The uploaded date time of file, only valid for `gridfs`
   */
  upload_date?: Date
}

export interface FileStorageInterface {
  /**
   * The driver type of file storage : `gridfs` or `localfs`
   */
  type: string

  /**
   * The bucket name, default should be `public`
   */
  bucket: string

  /**
   * Save file: mainly used to save uploaded temporary files to the storage
   * @param file_path The path of the file to save
   * @param filename File name to be stored
   * @param metadata Meta data of file to be stored, only valid for `gridfs`
   */
  save(file_path: string, filename: string, metadata?: any): Promise<FileInfo>

  /**
   * Obtain file information
   * @param filename
   */
  info(filename: string): Promise<FileInfo>

  /**
   * Delete file
   * @param filename 
   */
  delete(filename: string): Promise<boolean>

  /**
   * Read file
   * @param filename 
   */
  read(filename: string): Promise<Buffer>

  /**
   * Create a read stream of file
   * @param filename 
   */
  createReadStream(filename: string): ReadStream
}
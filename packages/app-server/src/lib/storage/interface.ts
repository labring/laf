/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-18 16:43:18
 * @Description: 
 */

export interface FileInfo {
  filename: string,       // file name, including extension
  ext: string             // extension
  basename: string        // file name, excluding the extension
  size: number            // file size, in bytes
  path: string            // file path, relative path
  fullpath?: string       // file path, absolute path
  original_name?: string  // The original name of the file
  bucket?: string
}

export interface FileStorageInterface {

  /**
   * Save files: Mainly used to save (move) uploaded temporary files to the storage directory
   * @param filePath The path of the file to save
   */
  saveFile(filePath: string): Promise<FileInfo>

  /**
   * Obtain file information
   * @param filename
   */
  getFileInfo(filename: string): Promise<FileInfo>

  /**
   * Delete file
   * @param filename 
   */
  deleteFile(filename: string): Promise<boolean>

  /**
   * Read file
   * @param {string} filename 
   */
  readFile(filename: string, encoding?: string): Promise<Buffer>

  /**
   * Check that the folder name is secure
   * @param {string} name
   */
  checkSafeDirectoryName(name: string): boolean

  /**
   * Check that the file name is secure
   * @param {string} name
   */
  checkSafeFilename(name: string): boolean
}
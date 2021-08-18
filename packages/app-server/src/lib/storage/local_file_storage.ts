/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-18 16:40:16
 * @Description: 
 */

import * as fse from "fs-extra"
import * as assert from 'assert'
import { v4 as uuidv4 } from 'uuid'
import * as path from 'path'
import { FileInfo, FileStorageInterface } from "./interface"

export class LocalFileStorage implements FileStorageInterface {
  rootPath: string
  namespace: string

  constructor(rootPath: string, bucket: string = 'public') {
    this.rootPath = rootPath
    this.namespace = bucket
  }

  /**
   * Save file
   * @param filePath 
   * @returns 
   */
  async saveFile(filePath: string): Promise<FileInfo> {
    assert(filePath, `error: filePath is empty`)

    {
      const r = await fse.stat(filePath)
      assert(r.isFile(), `${filePath} is not a file`)
    }

    await fse.ensureDir(this.getBasePath())

    const pinfo = path.parse(filePath)

    const basename = this.getFileName()
    const filename = `${basename}${pinfo.ext}`
    const savedPath = this.getFilePath(filename)

    await fse.copyFile(filePath, savedPath)

    const info = await this.getFileInfo(filename)
    return info
  }


  /**
   * Read file
   * @param filename 
   * @param encoding 
   * @returns 
   */
  async readFile(filename: string, encoding?: string): Promise<any> {
    assert(filename, 'error: filename is empty')

    const info = await this.getFileInfo(filename)

    const data = await fse.readFile(info.fullpath, encoding)
    return data
  }

  /**
   * Get file info
   * @param filename 
   * @returns 
   */
  async getFileInfo(filename: string): Promise<FileInfo> {
    const filepath = this.getFilePath(filename)

    const pinfo = path.parse(filepath)

    const stat = await fse.stat(filepath)

    const info: FileInfo = {
      filename,
      basename: pinfo.name,
      ext: pinfo.ext,
      path: path.join('/', this.namespace, filename),
      fullpath: filepath,
      size: stat.size,
      bucket: this.namespace
    }

    return info
  }

  /**
   * Delete file
   * @param filename 
   * @returns 
   */
  async deleteFile(filename: string): Promise<boolean> {
    const filepath = this.getFilePath(filename)
    try {
      const r = await fse.stat(filepath)
      assert(r.isFile(), `${filename} must be a file`)

      await fse.remove(filepath)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Check that the directory name is secure
   * A secure file or folder name can contain only letters, digits, underscores (_), hyphens (-), and periods (.)
   * @param name 
   * @returns 
   */
  checkSafeDirectoryName(name: string): boolean {
    assert(typeof name === 'string', 'name must be a string')

    const reg = /^([0-9]|[A-z]|_|-){3,64}$/
    return reg.test(name)
  }

  /**
   * Check that the file name is secure
   */
  checkSafeFilename(name: string): boolean {
    assert(typeof name === 'string', 'name must be a string')
    const reg = /^([0-9]|[A-z]|_|-|\.){3,64}$/
    return reg.test(name)
  }

  /**
   * Generate file name
   * @returns 
   */
  private getFileName() {
    return uuidv4()
  }

  /**
   * Obtain the full path of the file
   * @param filename 
   * @returns 
   */
  private getFilePath(filename: string): string {
    return path.join(this.getBasePath(), filename)
  }

  /**
   * Obtain the current storage path
   * @returns 
   */
  private getBasePath(): string {
    return path.join(this.rootPath, this.namespace)
  }
}
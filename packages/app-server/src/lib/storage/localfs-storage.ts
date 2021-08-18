/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-19 01:40:35
 * @Description: 
 */

import * as fse from "fs-extra"
import * as assert from 'assert'
import * as path from 'path'
import { FileInfo, FileStorageInterface } from "./interface"

export class LocalFSStorage implements FileStorageInterface {
  readonly type = 'localfs'
  readonly root_path: string
  readonly bucket: string

  constructor(root_path: string, bucket: string = 'public') {
    this.root_path = root_path
    this.bucket = bucket
  }

  async save(file_path: string, filename: string): Promise<FileInfo> {
    assert(file_path, `error: file_path is empty`)
    assert(filename, `error: filename is empty`)

    {
      const r = await fse.stat(file_path)
      assert(r.isFile(), `${file_path} is not a file`)
    }

    await fse.ensureDir(this.getBasePath())

    const savedPath = this.resolveFilePath(filename)

    await fse.copyFile(file_path, savedPath)

    const info = await this.info(filename)
    return info
  }

  async read(filename: string): Promise<Buffer> {
    assert(filename, 'error: filename is empty')

    const info = await this.info(filename)
    const data = await fse.readFile(info.fullpath)
    return data
  }

  async info(filename: string): Promise<FileInfo> {
    assert(filename, 'error: filename is empty')

    const filepath = this.resolveFilePath(filename)
    const stat = await fse.stat(filepath)

    const info: FileInfo = {
      filename,
      path: path.join('/', this.bucket, filename),
      fullpath: filepath,
      size: stat.size,
      bucket: this.bucket
    }

    return info
  }

  async delete(filename: string): Promise<boolean> {
    assert(filename, 'error: filename is empty')
    const filepath = this.resolveFilePath(filename)
    try {
      const r = await fse.stat(filepath)
      assert(r.isFile(), `${filename} must be a file`)

      await fse.remove(filepath)
      return true
    } catch (error) {
      return false
    }
  }

  createReadStream(filename: string): fse.ReadStream {
    assert(filename, 'error: filename is empty')

    const filepath = this.resolveFilePath(filename)
    return fse.createReadStream(filepath)
  }

  /**
   * Check that the directory name is secure
   * A secure file or folder name can contain only letters, digits, underscores (_), hyphens (-), and periods (.)
   * @param name 
   * @returns 
   */
  static checkDirectoryName(name: string): boolean {
    assert(typeof name === 'string', 'name must be a string')

    const reg = /^([0-9]|[A-z]|_|-){3,64}$/
    return reg.test(name)
  }

  /**
   * Check that the file name is secure
   */
  static checkFilename(name: string): boolean {
    assert(typeof name === 'string', 'name must be a string')
    const reg = /^([0-9]|[A-z]|_|-|\.){3,64}$/
    return reg.test(name)
  }


  /**
   * Obtain the full path of the file
   * @param filename 
   * @returns 
   */
  private resolveFilePath(filename: string): string {
    return path.join(this.getBasePath(), filename)
  }

  /**
   * Obtain the current storage path
   * @returns 
   */
  private getBasePath(): string {
    return path.join(this.root_path, this.bucket)
  }
}
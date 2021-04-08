import * as fse from "fs-extra"
import * as assert from 'assert'
import { v4 as uuidv4 } from 'uuid'
import * as path from 'path'
import { FileInfo, FileStorageInterface } from "./interface"

export class LocalFileStorage implements FileStorageInterface {
  rootPath: string
  namespace: string

  constructor(rootPath: string, namespace: string = 'default') {
    this.rootPath = rootPath
    this.namespace = namespace
  }

  /**
   * 保存临时文件
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
   * 读文件
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
   * 获取文件信息
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
      namespace: this.namespace
    }

    return info
  }

  /**
   * 删除文件
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
   * 生成文件名
   * @returns 
   */
  private getFileName() {
    return uuidv4()
  }

  /**
   * 获取文件全路径
   * @param filename 
   * @returns 
   */
  private getFilePath(filename: string): string {
    return path.join(this.getBasePath(), filename)
  }

  /**
   * 获取当前 storage 存储目录
   * @returns 
   */
  private getBasePath(): string {
    return path.join(this.rootPath, this.namespace)
  }
}
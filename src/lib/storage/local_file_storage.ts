import * as fse from "fs-extra"
import * as assert from 'assert'
import { v4 as uuidv4 } from 'uuid'
import * as path from 'path'

export class LocalFileStorage implements FileStorageInterface {
  rootPath: string
  namespace: string

  constructor(rootPath: string, namespace: string = 'default') {
    this.rootPath = rootPath
    this.namespace = namespace
  }

  async saveFile(filePath: string): Promise<FileInfo> {
    assert(filePath, `filePath is empty`)

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

  private getFileName() {
    return uuidv4()
  }

  private getFilePath(filename: string): string {
    return path.join(this.getBasePath(), filename)
  }

  private getBasePath(): string {
    return path.join(this.rootPath, this.namespace)
  }
}
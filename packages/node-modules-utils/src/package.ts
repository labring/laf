import * as fse from 'fs-extra'
import * as path from 'path'
export class PackageInfo {
  /**
   * node_modules 绝对路径
   */
  protected nodeModulesRoot: string

  protected importPath: string

  /**
   * package.json 的内容
   */
  info: any

  /**
   * root path
   * 此包根目录的绝对路径
   */
  rootPath: string

  /**
  * entry file
  * 为 main / module 指定的入口文件
  */
  entryFile: string

  /**
   * entry path
   * 为 main / module 指定的入口文件所在目录
   */
  entryPath: string

  get name(): string {
    return this.info?.name
  }

  get version(): string {
    return this.info?.version
  }

  get dependencies(): Object {
    return this.info?.dependencies
  }

  get dependencyNames(): string[] {
    if (!this.dependencies) return []
    return Object.keys(this.dependencies)
  }

  /**
   * common entry file
   */
  get main(): string {
    return this.info?.main
  }

  /**
   * esm entry file
   */
  get module(): string {
    return this.info?.module
  }

  /**
   * 
   * @param importPath 引入的包路径，如 `less-api`, `axios/index`
   * @param nodeModulesRoot node_modules 所在目录
   */
  constructor(importPath: string, nodeModulesRoot: string) {
    this.importPath = importPath
    if (nodeModulesRoot) {
      this.nodeModulesRoot = nodeModulesRoot
    }
  }

  /**
   * 解析包
   */
  async parse(onlyInfo = false) {
    await this.parsePackageInfo()
    if (!onlyInfo) {
      await this.parsePackageEntry()
    }
  }

  /**
   * 解析包信息 package.json
   * @returns 
   */
  async parsePackageInfo() {
    let pkg_path = this.abs_path(this.importPath)
    let result = null

    while (this.relative_path(pkg_path) != '') {
      result = await this.readPackageJson(path.join(pkg_path, 'package.json'))
      if (result) {
        break
      }
      pkg_path = path.dirname(pkg_path)
    }

    if (!result) {
      throw new Error('parse package info error: ' + this.importPath)
    }

    this.info = result
    this.rootPath = pkg_path
  }

  /**
   * 解析包入口信息: main / module
   */
  async parsePackageEntry() {
    let entry = ''
    if (this.main) {
      entry = this.main
    } else if (this.module) {
      entry = this.module
    }

    const entryFile = path.join(this.rootPath, entry)
    let entryPath = entryFile
    const stat = await this.exists(entryFile)
    if (!stat) {
      throw new Error('entry file or path not exists')
    }

    if (stat.isFile()) {
      entryPath = path.dirname(entryPath)
    }

    this.entryFile = entryFile
    this.entryPath = entryPath
  }

  /**
   * 读取 package.json 
   * @param dir 
   * @returns 
   */
  async readPackageJson(file_path: string) {
    const found = await this.exists(file_path)
    if (!found) {
      return null
    }

    const data = await fse.readFile(file_path, 'utf8')
    return JSON.parse(data)
  }

  /**
   * 转绝对路径，基于 node_modules 路径
   * @param pathInPackage 
   * @returns 
   */
  abs_path(pathInPackage: string) {
    return path.join(this.nodeModulesRoot, pathInPackage)
  }

  /**
   * 转相对路径，基于 node_modules 路径
   * @param absPath 
   * @returns 
   */
  relative_path(absPath: string) {
    return path.relative(this.nodeModulesRoot, absPath)
  }

  /**
   * 文件或文件是否存在
   * @param p 
   */
  async exists(p: string) {
    try {
      const stat = await fse.stat(p)
      return stat
    } catch (error) {
      return null
    }
  }
}
import * as fse from 'fs-extra'
import * as path from 'path'
import { ImportParser } from './import-parser'
import { PackageInfo } from './package'

export interface DeclarationType {
  packageName: string
  path: string
  content: string,
  from?: string
}


/**
 * 解析、处理包的类型声明文件
 */
export class PackageDeclaration extends PackageInfo {

  protected _types: DeclarationType[] = []

  get declarations(): DeclarationType[] {
    return this._types
  }

  /**
   * 解析到的类型文件的入口文件，绝对路径
   */
  typingsEntryPath: string

  /**
   * 加载类型文件
   * @returns 
   */
  async load() {
    await this.parse()

    // 先从 @types 目录中查找
    const typePkgName = `@types/${this.name}`
    const r = await this.loadFromTypesPackage(typePkgName)
    if (r && r.length) {
      this._types.push(...r)
      this._types.forEach(data => data['from'] = this.name)
      return
    }

    await this.loadFromSelfPackage()
  }

  /**
   * 从 `@types` 目录获取声明文件
   */
  async loadFromTypesPackage(typePkgName: string): Promise<DeclarationType[]> {
    // check @types/pkg exists
    const pkg = new PackageInfo(typePkgName, this.nodeModulesRoot)
    await pkg.parsePackageInfo().catch(() => { })
    if (!pkg.info) {
      return []
    }

    // load type file
    const typeFile = pkg.info?.types || pkg.info?.typings || 'index.d.ts'
    const typeFilePath = path.join(pkg.rootPath, typeFile)
    if (!await pkg.exists(typeFilePath)) {
      return []
    }

    const data = await fse.readFile(typeFilePath, 'utf8')
    const results: DeclarationType[] = [{ packageName: pkg.name, path: pkg.relative_path(typeFilePath), content: data }]

    // load sub dependencies type
    const deps = pkg.dependencyNames

    for (const dep of deps) {
      const r = await this.loadFromTypesPackage(dep)
      results.push(...r)
    }
    return results
  }


  /**
   * 从包目录获取声明文件
   */
  async loadFromSelfPackage() {
    // 解析类型入口文件路径
    this.typingsEntryPath = await this.resolveTypingsEntryPath()

    // 从入口文件开始，解析并读取所有类型文件
    await this.readTypings(this.typingsEntryPath)

    // 处理结果中绝对路径
    for (const data of this._types) {
      data.path = this.fixTypingFilePath(data.path)
    }
  }

  /**
   * 获取 `typings` (Typescript 类型声明文件的入口) 文件绝对路径
   * 1. 尝试读取 package.json#typings，若为目录，则自动拼上 index.d.ts 
   * 2. 如果未读取到，则指定 package.json#main 所在目录 下的 index.d.ts 为 typings
   */
  async resolveTypingsEntryPath() {

    let defaultFilename = 'index.d.ts'
    const entryStat = await this.exists(this.entryFile)
    if (entryStat.isFile()) {
      const { name } = path.parse(this.entryFile)
      defaultFilename = `${name}.d.ts`
    }

    const defaultTypings = path.join(this.entryPath, defaultFilename)
    const typings = this.info?.typings || this.info?.types

    if (!typings) {
      return defaultTypings
    }

    const typingFile = path.join(this.rootPath, typings)
    const stat = await this.exists(typingFile)
    if (!stat) {
      return defaultTypings
    }

    if (stat.isDirectory()) {
      return path.join(typingFile, defaultFilename)
    }

    return typingFile
  }

  /**
   * 读取 typings 类型文件
   * @param typingFilePath 绝对路径
   * @returns 
   */
  protected async readTypings(typingFilePath: string): Promise<DeclarationType[]> {

    if (!typingFilePath) {
      return []
    }

    if (!await this.exists(typingFilePath)) {
      return []
    }

    const data = await this.loadTypingFile(typingFilePath)
    if (!data) {
      return []
    }

    const entryTypings = {
      from: this.name,
      packageName: this.name,
      path: typingFilePath,   // 暂保留为绝对路径，待全部加载完，返回之前 统一处理为相对路径
      content: data
    }

    this._types.push(entryTypings)

    // 解析并处理引入的子类型文件
    const parser = new ImportParser()
    const deps = parser.parseDependencies(data, entryTypings.path)

    for (const dep of deps) {
      if (dep.kind !== 'relative') continue

      const filepath = await this.resolveImportPath(dep.importPath, dep.sourcePath)

      // 已解析的跳过，防止死循环
      const found = this._types.filter(data => data.path === filepath)
      if (found.length)
        continue

      await this.readTypings(filepath)
    }
  }

  /**
   * 解析 import 路径为对应文件的绝对路径
   * ```ts
   *  import './document'
   *  import './geo/index'
   *  import './geo'
   * ```
   * @param importPath 代码中引入路径，相对路径
   * @param sourcePath 所在代码文件路径，要求绝对路径
   */
  protected async resolveImportPath(importPath: string, sourcePath: string) {
    const dir_path = path.dirname(sourcePath)
    const full_path = path.join(dir_path, importPath)

    return await this.tryResolveImportPath(full_path)
  }


  /**
   * 尝试解析引入路径:
   * @param filepath 绝对路径
   */
  protected async tryResolveImportPath(absImportPath: string): Promise<string | null> {
    const stat0 = await this.exists(absImportPath)

    // 如果文件不存在，则拼接 '.d.ts' 后再尝试解析
    if (!stat0) {
      if (absImportPath.endsWith('.d.ts')) {
        return null
      }

      const p = absImportPath + '.d.ts'
      return this.tryResolveImportPath(p)
    }

    if (stat0.isFile()) {
      return absImportPath
    }

    // 如果是文件夹，则拼接 'index.d.ts' 后再尝试解析
    if (stat0.isDirectory()) {
      const p = path.join(absImportPath, 'index.d.ts')
      return this.tryResolveImportPath(p)
    }
  }


  /**
   * 修复获取的类型文件绝对路径为 [packageName/typingsFilePath]：
   * 1. 转为相对路径，相对于 `this.typingsEntryPath`
   * 2. 拼接包名
   * @param filepath 
   */
  protected fixTypingFilePath(filepath: string) {
    const dir_path = path.dirname(this.typingsEntryPath)
    // 先转为相对路径
    const rel_path = path.relative(dir_path, filepath)

    const final_path = path.join(this.name, rel_path)
    return final_path
  }

  /**
   * 加载类型文件内容
   * @param filepath 
   * @returns 
   */
  protected async loadTypingFile(filepath: string) {
    return await fse.readFile(filepath, 'utf8')
  }
}


/**
 * 专用于加载 Node 官方内置的包类型文件
 */
export class NodePackageDeclarations {

  nodeModulesRoot: string

  static NODE_PACKAGES = [
    'assert', 'crypto', 'child_process', 'path', 'process', 'readline', 'querystring', 'os',
    'dns', 'domain', 'http', 'https', 'http2', 'module', 'net', 'tls', 'dgram',
    'stream', 'tty', 'url', 'wasi', 'v8', 'vm', 'worker_threads', 'zlib',
    'punycode', 'perf_hooks', 'fs', 'events', 'constants', 'console', 'cluster', 'buffer',
    'fs/promises', 'globals', 'util'
  ]


  typesDir: string

  constructor(nodeModulesRoot: string) {
    this.nodeModulesRoot = nodeModulesRoot
    this.typesDir = path.join(this.nodeModulesRoot, '@types/node')
  }

  /**
   * 获取 node 所有官方包的声明文件
   */
  async getNodeBuiltinPackage(packageName: string): Promise<DeclarationType> {

    const full_path = path.join(this.typesDir, `${packageName}.d.ts`)
    const data = await fse.readFile(full_path, 'utf8')

    return {
      packageName: packageName,
      content: data,
      path: `@types/node/${packageName}.d.ts`,
      from: 'node'
    }
  }
}

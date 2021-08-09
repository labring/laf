
import * as monaco from 'monaco-editor'
import { loadPackageTypings } from '@/api/func'
import { global_declare } from './globals'

/**
 * 解析 ts 文件中的 import 依赖
 */
export class ImportParser {
  REGEX_DETECT_IMPORT = /(?:(?:(?:import)|(?:export))(?:.)*?from\s+["']([^"']+)["'])|(?:\/+\s+<reference\s+path=["']([^"']+)["']\s+\/>)/g;

  /**
   * 解析 ts 文件中的 import 依赖
   * @param {string} source source code
   * @returns
   */
  parseDependencies(source) {
    const cleaned = source
    return [...cleaned.matchAll(this.REGEX_DETECT_IMPORT)]
      .map(x => x[1] ?? x[2])
      .filter(x => !!x)
      .map(imp => {
        return imp
      })
  }
}

/**
 * Ts 自动对引入依赖进行类型提示加载
 */
export class AutoImportTypings {
  _parser = new ImportParser()

  /**
   * 已加载过的依赖
   */
  _loaded = []

  /**
   * 解析 ts 代码中的 import 包， 并加载其类型文件
   * @param {string} source ts 代码
   * @returns
   */
  async parse(source) {
    const rets = this._parser.parseDependencies(source)
    if (!rets || !rets.length) return

    const newImports = rets.filter(pkg => !this.isLoaded(pkg))
    for (const pkg of newImports) {
      await this.loadDeclaration(pkg)
    }
  }

  /**
   * 加载初始默认的 类型文件
   */
  loadDefaults() {
    this.addExtraLib({ path: 'globals.d.ts', content: global_declare })
    if (!this.isLoaded('globals')) { this.loadDeclaration('globals') }
    if (!this.isLoaded('less-api-database')) { this.loadDeclaration('less-api-database') }
    if (!this.isLoaded('axios')) { this.loadDeclaration('axios') }
    if (!this.isLoaded('cloud-function-engine')) { this.loadDeclaration('cloud-function-engine') }
    if (!this.isLoaded('mongodb')) { this.loadDeclaration('mongodb') }
  }

  /**
   * 包是否已加载
   * @param {string} packageName
   * @returns
   */
  isLoaded(packageName) {
    return this._loaded.includes(packageName)
  }

  /**
   * 从远程加载包的类型文件
   * @param {string} packageName
   * @returns
   */
  async loadDeclaration(packageName) {
    try {
      const r = await loadPackageTypings(packageName)
      if (r.code) {
        return
      }

      const rets = r.data || []
      for (const lib of rets) {
        this.addExtraLib(lib)
      }

      this._loaded.push(packageName)
    } catch (error) {
      console.error(`failed to load package: ${packageName} :`, error)
    }
  }

  /**
   * 添加类型文件到编辑器
   * @param {path: string, content: string} param0
   * @returns
   */
  addExtraLib({ path, content }) {
    const fullpath = `file:///node_modules/${path}`
    const defaults = monaco.languages.typescript.typescriptDefaults

    const loaded = defaults.getExtraLibs()
    const keys = Object.keys(loaded)

    if (keys.includes(fullpath)) {
      console.log(`${path} already exists in ts extralib`)
      return
    }
    try {
      defaults.addExtraLib(content, fullpath)
    } catch (error) {
      console.log(error, fullpath, keys)
      throw error
    }
  }

  getExtraLibs() {
    const defaults = monaco.languages.typescript.typescriptDefaults
    return defaults.getExtraLibs()
  }
}

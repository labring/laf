const fs = require('fs/promises')
const path = require('path')

class FunctionLoader {
  rootPath = path.join(__dirname, 'functions')

  /**
   * 获取函数目录列表
   * @returns {Promise<string[]>}
   */
  async getFunctionDirectoryList() {
    const dirs = await fs.readdir(this.rootPath)
    return dirs ?? []
  }

  /**
   * 获取函数
   * @returns {Promise<any[]>}
   */
  async getFunctions() {
    const dirs = await this.getFunctionDirectoryList()
    const funcPaths = dirs.map(dir => path.join(this.rootPath, dir))
    const results = []
    for (const fp of funcPaths) {
      const r = await this.loadFunction(fp)
      results.push(r)
    }
    return results
  }

  /**
   * 加载函数
   * @param {string}} func_path 
   * @returns 
   */
  async loadFunction(func_path) {
    const codePath = path.join(func_path, 'index.ts')
    const code = await this.loadFunctionCode(codePath)

    const metaPath = path.join(func_path, 'meta.json')
    const meta = await this.loadFunctionMeta(metaPath)

    if (!meta['status']) {
      meta['status'] = 0
    }
    return { ...meta, code }
  }

  /**
   * 获取函数代码
   * @param {Promise<string>} file_path 
   */
  async loadFunctionCode(file_path) {
    const data = await fs.readFile(file_path, 'utf-8')
    return data
  }

  /**
   * 获取函数 meta 信息
   * @param {string} file_path 
   */
  async loadFunctionMeta(file_path) {
    const data = await fs.readFile(file_path, 'utf-8')
    return JSON.parse(data)
  }
}

module.exports = {
  FunctionLoader
}
/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-17 17:34:58
 * @Description:  
 */

const fs = require('fs/promises')
const path = require('path')

class FunctionLoader {
  rootPath = path.join(__dirname, 'functions')

  /**
   * Get directory list of functions
   * @returns {Promise<string[]>}
   */
  async getFunctionDirectoryList() {
    const dirs = await fs.readdir(this.rootPath)
    return dirs ?? []
  }

  /**
   * Load functions
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
   * Load a function
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
   * Load function's code
   * @param {Promise<string>} file_path 
   */
  async loadFunctionCode(file_path) {
    const data = await fs.readFile(file_path, 'utf-8')
    return data
  }

  /**
   * Load meta of function
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
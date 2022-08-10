import * as fs from 'node:fs'
import * as path from 'node:path'
import { FUNCTIONS_FILE, META_FILE } from './constants'

/**
 * get remote function list
 * @param { data } any
 * @returns
 */
export function getRemoteList(data: any) {
  return data.map((item: any) => {
    return { key: item.name, version: item.version, value: item }
  })
}


/**
 * get local function list
 * @param { dir } string
 * @returns
 */

export function getLocalList(dir: string) {

  let localList = []

  const files = fs.readdirSync(dir)
  for (let i = 0; i < files.length; i++) {

    const item = files[i]

    const itemDir = path.resolve(dir, item)

    const stat = fs.lstatSync(itemDir)
    // check if directory
    if (stat.isDirectory() === true) {

      const funcFile = path.resolve(itemDir, FUNCTIONS_FILE)
      const metaFile = path.resolve(itemDir, META_FILE)
      const funcName = path.relative(dir, itemDir)

      // check if exist function file
      if (fs.existsSync(funcFile)) {

        // check if exist meta file
        if (fs.existsSync(metaFile)) {
          const metadata = JSON.parse(fs.readFileSync(metaFile, 'utf-8'))
          localList.push({ key: funcName, version: metadata.version })
        } else {
          localList.push({ key: funcName, version: 0 })
        }
      } else {
        localList.push({ key: funcName, version: 0 })
      }
    }
  }

  return localList

}

import * as path from 'node:path'
import * as fs from 'node:fs'
import { ensureDirectory } from "./util"
import { FUNCTIONS_DIR, FUNCTIONS_FILE, META_FILE, PROJECT_DIR } from "./constants"

const functionsDir = path.resolve(PROJECT_DIR, FUNCTIONS_DIR)

/**
 * create function list
 * @param { localList } any
 * @param { remoteList } any
 * @returns
 */
export function getCreateList(remoteList: any, localList: any) {
  const createFunction = remoteList.filter(remote => {
    const local = localList.find(local => local.key === remote.key)

    if (!local) {
      return true
    }
  })
  return createFunction

}


/**
 * updatefunction list
 * @param { localList } any
 * @param { remoteList } any
 * @returns
 */
export function getUpdateList(remoteList: any, localList: any,) {
  const updateFunction = remoteList.filter(local => {
    const remote = localList.find(remote => local.key === remote.key && local.version != remote.version)
    if (remote) {
      return true
    }
  })
  return updateFunction
}


/**
* create function list
* @param { localList } any
* @param { remoteList } any
* @returns
*/
export function getDeleteList(remoteList: any, localList: any) {
  const deleteFunction = localList.filter(local => {
    const remote = remoteList.find(remote => local.key === remote.key)
    if (!remote) {
      return true
    }
  })
  return deleteFunction
}

/**
 * create function
 * @param { data } any
 * @returns
 */
export function createfn(data: any) {

  const funcNameDir = path.resolve(functionsDir, data.name)
  ensureDirectory(funcNameDir)

  const funcFile = path.resolve(funcNameDir, FUNCTIONS_FILE)
  const metaFile = path.resolve(funcNameDir, META_FILE)

  // get metadata
  const meta = getMetaData(data)
  fs.writeFileSync(funcFile, data.code)
  fs.writeFileSync(metaFile, JSON.stringify(meta))
  return true

}


/**
 * update function
 * @param { data } any
 * @returns
 */
export function updatefn(data: any) {

  const funcNameDir = path.resolve(functionsDir, data.name)
  const funcFile = path.resolve(funcNameDir, FUNCTIONS_FILE)
  const metaFile = path.resolve(funcNameDir, META_FILE)

  // if exist meta file
  if (!fs.existsSync(metaFile)) {
    const meta = getMetaData(data)
    fs.writeFileSync(funcFile, data.code)
    fs.writeFileSync(metaFile, JSON.stringify(meta))
    return true
  }

  const metaData = JSON.parse(fs.readFileSync(metaFile, 'utf8'))
  // check version
  if (data.version != metaData.version) {
    const meta = getMetaData(data)
    fs.writeFileSync(funcFile, data.code)
    fs.writeFileSync(metaFile, JSON.stringify(meta))
    return true
  }
}


/**
 * delete function
 * @param { funcName } string
 * @returns
 */
export function deletefn(funcName: string) {

  const funcNameDir = path.resolve(functionsDir, funcName)
  const funcFile = path.resolve(funcNameDir, FUNCTIONS_FILE)
  const metaFile = path.resolve(funcNameDir, META_FILE)
  // check if exist function file
  if (fs.existsSync(funcFile)) { fs.unlinkSync(funcFile) }
  // check if exist meta file
  if (fs.existsSync(metaFile)) { fs.unlinkSync(metaFile) }

  fs.rmdirSync(funcNameDir)
  return true
}


/**
 * update function
 * @param { data } any
 * @returns
 */
function getMetaData(data: any) {

  return {
    name: data.name,
    label: data.label,
    hash: data.hash,
    tags: data.tags,
    description: data.description,
    enableHTTP: data.enableHTTP,
    status: data.status,
    triggers: data.triggers,
    version: data.version
  }

}
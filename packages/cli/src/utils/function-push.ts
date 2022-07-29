
import * as path from 'node:path'
import * as fs from 'node:fs'
import { compileTs2js } from "./util-lang"
import { createFunction, deleteFunction, editFunction, getFunctionByName, pushFunction } from "../api/functions"
import { FUNCTIONS_DIR, FUNCTIONS_FILE, META_FILE, PROJECT_DIR } from "./constants"

const functionsDir = path.resolve(PROJECT_DIR, FUNCTIONS_DIR)

/**
 * create function list
 * @param { localList } any
 * @param { remoteList } any
 * @returns
 */
export function getCreateList(remoteList: any, localList: any) {
  const createFunction = localList.filter(local => {
    const remote = remoteList.find(remote => local.key === remote.key)

    if (!remote) {
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
  const deleteFunction = remoteList.filter(remote => {
    const local = localList.find(local => local.key === remote.key)
    if (!local) {
      return true
    }
  })
  return deleteFunction
}


/**
 * create function
 * @param { appid } string
 * @param { functionName } string
 * @returns
 */
export async function createRemoteFn(appid: string, functionName: string) {

  const functionNameDir = path.resolve(functionsDir, functionName)
  const funcFile = path.resolve(functionNameDir, FUNCTIONS_FILE)

  // check if exist function file
  if (!fs.existsSync(funcFile)) {
    console.error(`${functionName} index.ts not exist`)
    return false
  }

  // create function params
  const code = fs.readFileSync(funcFile, 'utf8')
  const data = {
    code: code,
    name: functionName,
    label: functionName,
    status: 1,
    enableHTTP: true,
    compiledCode: compileTs2js(code),
    debugParams: '{}',
  }

  const res = await createFunction(appid, data)
  if (res.data) {
    // create meta file
    await createMetaFile(appid, functionName)
    console.log("create success")
  }
}

/**
 * update function
 * @param { data } any
 * @returns
 */
export async function updateRemoteFn(appid: string, functionName: string) {

  const functionNameDir = path.resolve(functionsDir, functionName)
  const funcFile = path.resolve(functionNameDir, FUNCTIONS_FILE)

  if (!fs.existsSync(funcFile)) {
    console.error(`${functionName} index.ts not exist`)
    return false
  }

  // push function
  const code = fs.readFileSync(funcFile, 'utf8')
  const data = {
    code: code,
    debugParams: JSON.stringify({ "code": "laf" })
  }
  const res = await pushFunction(appid, functionName, data)
  if (res.data) {
    await createMetaFile(appid, functionName)
  }
}


/**
 * delete function
 * @param { funcName } string
 * @returns
 */
export async function deleteRemoteFn(appid: string, functionId: string) {
  const editResult = await editFunction(appid, functionId, { 'status': 0 })
  if (!editResult.data.modifiedCount) {
    console.error('修改失败')
  }
  const res = await deleteFunction(appid, functionId,)
  if (!res.data.deletedCount) {
    console.error('删除失败')
  }
}


/**
 * create meta file
 * @param { appid } string
 * @param { functionName } string
 * @returns
 */
async function createMetaFile(appid: string, functionName: string) {

  // get function
  const result = await getFunctionByName(appid, functionName)

  const meta = getMetaData(result.data)

  const funcNameDir = path.resolve(functionsDir, functionName)
  const metaFile = path.resolve(funcNameDir, META_FILE)

  fs.writeFileSync(metaFile, JSON.stringify(meta))
}


/**
 * get meta data
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
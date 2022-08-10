import { pullFunction } from "../api/functions"
import * as path from 'node:path'

import { FUNCTIONS_DIR, PROJECT_DIR } from '../utils/constants'
import { ensureDirectory } from '../utils/util'
import { getLocalList, getRemoteList } from "../utils/function-lists"
import { createRemoteFn, deleteRemoteFn, getCreateList, getDeleteList, getUpdateList, updateRemoteFn } from "../utils/function-push"

/**
 * pull function
 * @param { appid} string
 * @param { functionName } string
 * @returns
 */
export async function handlePushListCommand(appid: string, options: any) {

  // functions dir
  const functionsDir = path.resolve(PROJECT_DIR, FUNCTIONS_DIR)
  ensureDirectory(functionsDir)

  const response = await pullFunction(appid, '')
  if (!response.data) {
    return false
  }

  const remoteList = getRemoteList(response.data)
  const localList = getLocalList(functionsDir)

  // create list
  const createList = getCreateList(remoteList, localList)
  if (createList.length > 0) {
    createList.forEach(async (item) => {
      await createRemoteFn(appid, item.key)
    })
  }

  //update list
  const updateList = getUpdateList(remoteList, localList)
  if (updateList.length > 0) {
    updateList.forEach(async (item2) => {
      await updateRemoteFn(appid, item2.key)
    })
  }

  // delete list
  const deleteList = getDeleteList(remoteList, localList)
  if (deleteList.length > 0) {
    if (options.forceOverwrite) {
      deleteList.forEach(async (item3) => {
        await deleteRemoteFn(appid, item3.value._id)
      })
    }
  }
}
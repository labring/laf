import * as path from 'node:path'
import { pullFunction } from "../api/functions"
import { FUNCTIONS_DIR, PROJECT_DIR } from '../utils/constants'
import { ensureDirectory } from '../utils/util'
import { getLocalList, getRemoteList } from "../utils/function-lists"
import { createfn, deletefn, getCreateList, getDeleteList, getUpdateList, updatefn } from "../utils/function-pull"

/**
 * pull function
 * @param { appid} string
 * @param { functionName } string
 * @returns
 */
export async function handlePullListCommand(appid: string, options: any) {

  const functionsDir = path.resolve(PROJECT_DIR, FUNCTIONS_DIR)
  ensureDirectory(functionsDir)
  const response = await pullFunction(appid, '')

  if (!response.data) {
    return false
  }

  const remoteList = getRemoteList(response.data)
  const localList = await getLocalList(functionsDir)

  // create list
  const createList = getCreateList(remoteList, localList)
  if (createList.length > 0) {
    createList.forEach((item: any) => {

      createfn(item.value)

    })
  }

  // delete list
  const deleteList = getDeleteList(remoteList, localList)
  if (deleteList.length > 0) {

    if (options.forceOverwrite) {
      deleteList.forEach((item2: any) => {
        deletefn(item2.key)
      })

    } else {
      console.log("if you want to delete local, laf-cli fn pull -f")
    }
  }

  // update list
  const updateList = getUpdateList(remoteList, localList)
  if (updateList.length > 0) {
    updateList.forEach((item3: any) => {
      updatefn(item3.value)
    })
  }
}
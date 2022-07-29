import * as path from 'node:path'
import * as fs from 'node:fs'
import { FUNCTIONS_DIR, PROJECT_DIR } from '../utils/constants'
import { ensureDirectory } from '../utils/util'
import { pullFunction } from "../api/functions"
import { createfn, updatefn } from "../utils/function-pull"


/**
 * pull function
 * @param { appid} string
 * @param { functionName } string
 * @returns
 */
export async function handlePullOneCommand(appid: string, functionName: string) {

  // functions dir
  const functionsDir = path.resolve(PROJECT_DIR, FUNCTIONS_DIR)

  ensureDirectory(functionsDir)

  const response = await pullFunction(appid, functionName)

  if (response.data.length > 0) {
    const funcNameDir = path.resolve(functionsDir, functionName)

    if (fs.existsSync(funcNameDir)) {
      updatefn(response.data[0])
    } else {
      createfn(response.data[0])
    }
  }
}
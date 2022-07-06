import { getFunctionByName, } from "../api/functions"

import { createRemoteFn, updateRemoteFn } from "../utils/function-push"



/**
 * pull function
 * @param { appid} string
 * @param { functionName } string
 * @returns
 */
export async function handlePushOneCommand(appid: string, functionName: string) {



  // get remote function
  const record = await getFunctionByName(appid, functionName)


  if (!record.data) {

    createRemoteFn(appid, functionName)
  } else {

    updateRemoteFn(appid, functionName)

  }

}
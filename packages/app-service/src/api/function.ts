/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-18 16:54:06
 * @Description: 
 */

import { Constants } from "../constants"
import { DatabaseAgent } from "../lib/database"

const db = DatabaseAgent.db

/**
 * Gets the cloud function by function name
 * @param func_name 
 * @returns 
 */
export async function getFunctionByName(func_name: string) {
  const r = await db.collection(Constants.function_collection)
    .where({ name: func_name })
    .getOne()

  if (!r.ok) {
    throw new Error(`getCloudFunction() failed to get function [${func_name}]: ${r.error.toString()}`)
  }

  return r.data
}

/**
  * Get the cloud function by function id
  * @param func_name 
  * @returns 
  */
export async function getFunctionById(func_id: string) {
  const r = await db.collection(Constants.function_collection)
    .where({ _id: func_id })
    .getOne()

  if (!r.ok) {
    throw new Error(`getCloudFunctionById() failed to get function [${func_id}]: ${r.error.toString()}`)
  }

  return r.data
}
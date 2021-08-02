import { Constants } from "../constants"
import { Globals } from "../lib/globals/index"

const db = Globals.db

/**
 * 请求触发器列表
 * @param status 默认为1，取所有开启的触发器
 * @returns 
 */
export async function getTriggers(status = 1) {
  const r = await db.collection(Constants.trigger_collection)
    .where({ status: status })
    .get()

  return r.data
}

/**
 * 根据ID请求触发器
 * @param id 
 * @returns 
 */
export async function getTriggerById(id: string) {
  const r = await db.collection(Constants.trigger_collection)
    .where({ _id: id })
    .getOne()

  return r.data
}
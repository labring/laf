import { Globals } from "../lib/globals"

const db = Globals.db

/**
 * 根据函数名获取云函数
 * @param func_name 
 * @returns 
 */
export async function getFunctionByName(func_name: string) {
  const r = await db.collection('functions')
    .where({ name: func_name })
    .getOne()

  if (!r.ok) {
    throw new Error(`getCloudFunction() failed to get function [${func_name}]: ${r.error.toString()}`)
  }

  return r.data
}

 /**
   * 根据ID获取云函数
   * @param func_name 
   * @returns 
   */
  export async function getFunctionById(func_id: string) {
    // 获取函数
    const r = await db.collection('functions')
      .where({ _id: func_id })
      .getOne()

    if (!r.ok) {
      throw new Error(`getCloudFunctionById() failed to get function [${func_id}]: ${r.error.toString()}`)
    }

    return r.data
  }
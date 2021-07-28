import { deepFreeze } from "./lib/utils/lang"


export const Constants = {
  /**
   * 云函数集合名
   */
  function_collection: '__deployed__functions',

  /**
   * 访问策略集合名
   */
  policy_collection: '__deployed__rules',
}

deepFreeze(Constants)
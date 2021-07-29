import { deepFreeze } from "./lib/utils/lang"


export const Constants = {
  /**
   * 云函数集合名
   */
  function_collection: '__deployed__functions',

  /**
   * 云函数触发器集合名
   */
  trigger_collection: '__deployed__triggers',

  /**
   * 访问策略集合名
   */
  policy_collection: '__deployed__rules',

  /**
   * 函数日志的集合名
   */
  function_log_collection: "__function_logs"
}

deepFreeze(Constants)
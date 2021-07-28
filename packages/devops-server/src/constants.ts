import { deepFreeze } from "./lib/utils/lang"


export const Constants = {
  /**
   * 部署到 app db 中的云函数集合名
   */
  function_collection: '__deployed__functions',

  /**
   * 部署到 app db 中的访问策略集合名
   */
  policy_collection: '__deployed__rules',
}

deepFreeze(Constants)
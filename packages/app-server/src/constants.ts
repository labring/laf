import { deepFreeze } from "./lib/utils/lang"

/**
 * Constants collection
 */
export const Constants = {
  /**
   * collection name of cloud functions
   */
  function_collection: '__deployed__functions',

  /**
   * collection name of cloud functions' triggers
   */
  trigger_collection: '__deployed__triggers',

  /**
   * collection name of policy which used for authenticating `client-access-database` requests
   */
  policy_collection: '__deployed__policies',

  /**
   * collection name of cloud functions' log
   */
  function_log_collection: "__function_logs"
}

deepFreeze(Constants)
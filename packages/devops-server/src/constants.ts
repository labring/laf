/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-17 17:28:13
 * @Description: 
 */

import { deepFreeze } from "./lib/utils/lang"

const coll_prefix = 'devops_'

/**
 * Constants collection
 */
export const Constants = {
  /**
   *  collection name of cloud functions deployed to app db
   */
  function_collection: '__deployed__functions',

  /**
   * collection name of triggers deployed to app db
   */
  trigger_collection: '__deployed__triggers',

  /**
   * collection name of policies deployed to app db
   */
  policy_collection: '__deployed__policies',

  /**
   * prefix of sys db collection name
   */
  coll_prefix: coll_prefix,

  /**
   * sys db collection names
   */
  cn: {
    admins: coll_prefix + 'admins',
    permissions: coll_prefix + 'permissions',
    roles: coll_prefix + 'roles',
    policies: coll_prefix + 'policies',
    functions: coll_prefix + 'functions',
    function_history: coll_prefix + 'function_history',
    triggers: coll_prefix + 'triggers',
    deploy_targets: coll_prefix + 'deploy_targets',
    deploy_requests: coll_prefix + 'deploy_requests',
    password: coll_prefix + 'password'
  }
}

deepFreeze(Constants)
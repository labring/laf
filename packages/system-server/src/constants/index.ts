/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-09-06 11:28:19
 * @Description: 
 */

import { deepFreeze } from "../utils/lang"
import { permissions } from "./permissions"
import { roles } from "./roles"

const coll_prefix = 'devops_'

/**
 * Constants collection
 */
export const Constants = {
  /**
   *  collection name of cloud functions published to app db
   */
  function_collection: '__published__functions',

  /**
   * collection name of triggers published to app db
   */
  trigger_collection: '__published__triggers',

  /**
   * collection name of policies published to app db
   */
  policy_collection: '__published__policies',

  /**
   * prefix of sys db collection name
   */
  coll_prefix: coll_prefix,

  /**
   * sys db collection names
   */
  cn: {
    accounts: coll_prefix + 'accounts',
    permissions: coll_prefix + 'permissions',
    roles: coll_prefix + 'roles',
    policies: coll_prefix + 'policies',
    functions: coll_prefix + 'functions',
    function_history: coll_prefix + 'function_history',
    triggers: coll_prefix + 'triggers',
    deploy_targets: coll_prefix + 'deploy_targets',
    deploy_requests: coll_prefix + 'deploy_requests',
    password: coll_prefix + 'password',
    applications: coll_prefix + 'applications',
  },

  /**
   * built-in permissions
   */
  permissions: permissions,

  /**
   * built-in roles for applications
   */
  roles: roles
}

deepFreeze(Constants)
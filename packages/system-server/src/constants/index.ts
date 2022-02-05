/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2022-01-19 15:57:36
 * @Description:
 */

import { deepFreeze } from '../utils/lang'
import { permissions } from './permissions'
import { roles } from './roles'

const coll_prefix = 'sys_'

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
   * collection name of config to app db
   */
  config_collection: '__config__',

  /**
   * prefix of sys db collection name
   */
  coll_prefix: coll_prefix,

  /**
   * sys db collection names
   */
  cn: {
    accounts: coll_prefix + 'accounts',
    policies: coll_prefix + 'policies',
    functions: coll_prefix + 'functions',
    function_history: coll_prefix + 'function_history',
    deploy_targets: coll_prefix + 'deploy_targets',
    deploy_requests: coll_prefix + 'deploy_requests',
    applications: coll_prefix + 'applications',
    recycles: coll_prefix + 'recycles',
    app_templates: coll_prefix + 'app_templates',
  },

  /**
   * built-in permissions
   */
  permissions: permissions,

  /**
   * built-in roles for applications
   */
  roles: roles,

  SYSTEM_EXTENSION_APPID: `00000000-0000-0000-0000-000000000000`,
}

deepFreeze(Constants)

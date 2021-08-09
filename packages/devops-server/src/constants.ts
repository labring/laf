import { deepFreeze } from "./lib/utils/lang"

const coll_prefix = 'devops_'

export const Constants = {
  /**
   * 部署到 app db 中的云函数集合名
   */
  function_collection: '__deployed__functions',

  /**
   * 部署到 app db 中云函数触发器集合名
   */
  trigger_collection: '__deployed__triggers',

  /**
   * 部署到 app db 中的访问策略集合名
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
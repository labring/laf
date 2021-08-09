const coll_prefix = 'devops_'

const Constants = {
  function_collection: '__deployed__functions',
  trigger_collection: '__deployed__triggers',
  policy_collection: '__deployed__policies',
  coll_prefix: coll_prefix,
  cn: {
    admins: coll_prefix + 'admins',
    permissions: coll_prefix + 'permissions',
    roles: coll_prefix + 'roles',
    policies: coll_prefix + 'policies',
    functions: coll_prefix + 'functions',
    function_history: coll_prefix + 'function_history',
    triggers: coll_prefix + 'triggers',
    deploy_targets: coll_prefix + 'deploy_targets',
    deploy_requests: coll_prefix + 'deploy_requests'
  }
}

Object.freeze(Constants)
Object.freeze(Object.cn)

export { Constants }

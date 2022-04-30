export const permissions = {
  APPLICATION_ADD: { name: 'application.add', label: '创建应用' },
  APPLICATION_READ: { name: 'application.read', label: '获取应用' },
  APPLICATION_UPDATE: { name: 'application.update', label: '编辑应用' },
  APPLICATION_REMOVE: { name: 'application.remove', label: '删除应用' },

  POLICY_ADD: { name: 'policy.add', label: '创建访问策略' },
  POLICY_READ: { name: 'policy.read', label: '获取访问策略' },
  POLICY_UPDATE: { name: 'policy.update', label: '编辑访问策略' },
  POLICY_REMOVE: { name: 'policy.remove', label: '删除访问策略' },

  FUNCTION_ADD: { name: 'function.add', label: '创建云函数' },
  FUNCTION_READ: { name: 'function.read', label: '获取云函数' },
  FUNCTION_UPDATE: { name: 'function.update', label: '编辑云函数' },
  FUNCTION_REMOVE: { name: 'function.remove', label: '删除云函数' },
  FUNCTION_DEBUG: { name: 'function.debug', label: '调试云函数' },

  TRIGGER_ADD: { name: 'trigger.add', label: '创建触发器' },
  TRIGGER_READ: { name: 'trigger.read', label: '获取触发器' },
  TRIGGER_UPDATE: { name: 'trigger.update', label: '编辑访触发器' },
  TRIGGER_REMOVE: { name: 'trigger.remove', label: '删除触发器' },

  DATABASE_MANAGE: { name: 'database.manage', label: '数据库数据管理' },

  PUBLISH_POLICY: { name: 'publish.policy', label: '发布数据访问策略' },
  PUBLISH_FUNCTION: { name: 'publish.function', label: '发布云函数' },

  DEPLOY_TARGET_READ: { name: 'deploy_target.read', label: '读取部署目标' },
  DEPLOY_TARGET_UPDATE: { name: 'deploy_target.update', label: '编辑部署目标' },
  DEPLOY_TARGET_ADD: { name: 'deploy_target.add', label: '添加部署目标' },
  DEPLOY_TARGET_REMOVE: { name: 'deploy_target.remove', label: '删除部署目标' },

  DEPLOY_REQUEST_READ: { name: 'deploy_request.read', label: '读取部署请求' },
  DEPLOY_REQUEST_UPDATE: { name: 'deploy_request.update', label: '编辑部署请求' },
  DEPLOY_REQUEST_ADD: { name: 'deploy_request.add', label: '添加部署请求' },
  DEPLOY_REQUEST_REMOVE: { name: 'deploy_request.remove', label: '删除部署请求' },
  DEPLOY_REQUEST_APPLY: { name: 'deploy_request.apply', label: '应用部署请求' },

  DEPLOY_TOKEN_CREATE: { name: 'deploy.create_token', label: '创建部署令牌' },

  FILE_READ: { name: 'file.read', label: '文件管理-读取文件列表' },
  FILE_UPDATE: { name: 'file.update', label: '文件管理-更新文件' },
  FILE_ADD: { name: 'file.add', label: '文件管理-创建文件' },
  FILE_REMOVE: { name: 'file.remove', label: '文件管理-删除文件' },

  FILE_BUCKET_ADD: { name: 'file.bucket.add', label: '文件管理-创建文件桶' },
  FILE_BUCKET_REMOVE: { name: 'file.bucket.remove', label: '文件管理-删除文件桶' },

  REPLICATE_AUTH_READ: { name: 'replicate_auth.read', label: '授权资源-读取授权应用' },
  REPLICATE_AUTH_ADD: { name: 'replicate_auth.add', label: '授权资源-创建授权应用' },
  REPLICATE_AUTH_REMOVE: { name: 'replicate_auth.remove', label: '授权资源-删除授权应用' },
  REPLICATE_AUTH_UPDATE: { name: 'replicate_auth.update', label: '授权资源-更新授权应用' },
  REPLICATES_PUT: { name: 'replicates.update', label: '远程推送' },
  REPLICATES_POST: { name: 'replicate.add', label: '应用部署' }

}


const pns = permissions

const developer = [
  pns.FUNCTION_ADD, pns.FUNCTION_READ, pns.FUNCTION_REMOVE, pns.FUNCTION_UPDATE,
  pns.FUNCTION_DEBUG, pns.PUBLISH_FUNCTION,
  pns.TRIGGER_ADD, pns.TRIGGER_READ, pns.TRIGGER_REMOVE, pns.TRIGGER_UPDATE
]

const dba = [
  pns.POLICY_ADD, pns.POLICY_READ, pns.POLICY_REMOVE, pns.POLICY_UPDATE,
  pns.PUBLISH_POLICY,
  pns.DATABASE_MANAGE,
  pns.FILE_ADD, pns.FILE_READ, pns.FILE_REMOVE, pns.FILE_UPDATE,
  pns.FILE_BUCKET_ADD, pns.FILE_BUCKET_REMOVE
]

const operator = [
  pns.DEPLOY_REQUEST_ADD, pns.DEPLOY_REQUEST_READ, pns.DEPLOY_REQUEST_REMOVE,
  pns.DEPLOY_REQUEST_UPDATE, pns.DEPLOY_REQUEST_APPLY,
  pns.DEPLOY_TARGET_ADD, pns.DEPLOY_TARGET_READ, pns.DEPLOY_TARGET_REMOVE,
  pns.DEPLOY_TARGET_UPDATE, pns.DEPLOY_TOKEN_CREATE
]

const owner = [
  pns.APPLICATION_ADD, pns.APPLICATION_READ, pns.APPLICATION_REMOVE,
  pns.APPLICATION_UPDATE,
  ...developer,
  ...dba,
  ...operator
]

export const roles = {
  developer: {
    name: 'developer',
    label: 'Developer',
    permissions: developer
  },
  dba: {
    name: 'dba',
    label: 'Database Administrator',
    permissions: dba
  },
  operator: {
    name: 'operator',
    label: 'Application Operator',
    permissions: operator
  },
  owner: {
    name: 'owner',
    label: 'Owner',
    permissions: owner
  }
}

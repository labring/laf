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

  REPLICATE_REQUEST_READ: { name: 'replicate_request.read', label: '推送请求-读取推送请求' },
  REPLICATE_REQUEST_ADD: { name: 'replicate_request.add', label: '推送请求-创建推送请求' },
  REPLICATE_REQUEST_REMOVE: { name: 'replicate_request.remove', label: '推送请求-删除推送请求' },
  REPLICATE_REQUEST_UPDATE: { name: 'replicate_request.update', label: '推送请求-更新推送请求' },

  WEBSITE_HOSTING_READ: { name: 'website_hosting.read', label: '网站托管-读取网站' },
  WEBSITE_HOSTING_ADD: { name: 'website_hosting.add', label: '网站托管-创建网站' },
  WEBSITE_HOSTING_REMOVE: { name: 'website_hosting.remove', label: '网站托管-删除网站' },
  WEBSITE_HOSTING_UPDATE: { name: 'website_hosting.update', label: '网站托管-更新网站' },

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
  pns.FILE_BUCKET_ADD, pns.FILE_BUCKET_REMOVE,
  pns.WEBSITE_HOSTING_READ, pns.WEBSITE_HOSTING_ADD, pns.WEBSITE_HOSTING_REMOVE, pns.WEBSITE_HOSTING_UPDATE,
]

const operator = [
  pns.REPLICATE_AUTH_READ,
  pns.REPLICATE_AUTH_ADD,
  pns.REPLICATE_AUTH_REMOVE,
  pns.REPLICATE_REQUEST_REMOVE,
  pns.REPLICATE_AUTH_UPDATE,
  pns.REPLICATE_REQUEST_READ,
  pns.REPLICATE_REQUEST_ADD,
  pns.REPLICATE_REQUEST_REMOVE,
  pns.REPLICATE_REQUEST_UPDATE
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

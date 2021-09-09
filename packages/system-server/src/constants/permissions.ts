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
}

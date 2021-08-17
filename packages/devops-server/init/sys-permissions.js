exports.permissions = [
  { name: 'role.create', label: '创建角色' },
  { name: 'role.read', label: '读取角色' },
  { name: 'role.edit', label: '编辑角色' },
  { name: 'role.delete', label: '删除角色' },

  { name: 'permission.read', label: '读取权限' },

  { name: 'admin.create', label: '创建管理员' },
  { name: 'admin.read', label: '获取管理员' },
  { name: 'admin.edit', label: '编辑管理员' },
  { name: 'admin.delete', label: '删除管理员' },

  { name: 'policy.create', label: '创建访问策略' },
  { name: 'policy.read', label: '获取访问策略' },
  { name: 'policy.edit', label: '编辑访问策略' },
  { name: 'policy.delete', label: '删除访问策略' },

  { name: 'rule.create', label: '创建访问策略规则' },
  { name: 'rule.read', label: '获取访问策略规则' },
  { name: 'rule.edit', label: '编辑访问策略规则' },
  { name: 'rule.delete', label: '删除访问策略规则' },

  { name: 'function.create', label: '创建云函数' },
  { name: 'function.read', label: '获取云函数' },
  { name: 'function.edit', label: '编辑云函数' },
  { name: 'function.delete', label: '删除云函数' },
  { name: 'function.debug', label: '调试云函数' },

  { name: 'function_logs.read', label: '查看云函数日志' },
  { name: 'function_logs.delete', label: '删除云函数日志' },

  { name: 'function_history.read', label: '查看云函数历史' },
  { name: 'function_history.create', label: '增加云函数历史' },
  { name: 'function_history.delete', label: '删除云函数历史' },

  { name: 'trigger.create', label: '创建触发器' },
  { name: 'trigger.read', label: '获取触发器' },
  { name: 'trigger.edit', label: '编辑访触发器' },
  { name: 'trigger.delete', label: '删除触发器' },

  { name: 'database.manage', label: '数据库数据管理'},
  { name: 'collections.get', label: 'DBM-获取集合列表'},
  { name: 'collections.createIndex', label: 'DBM-创建集合索引'},
  { name: 'collections.deleteIndex', label: 'DBM-删除集合索引' },
  
  { name: 'publish.policy', label: '发布数据访问策略'},
  { name: 'publish.function', label: '发布云函数' },
  { name: 'publish.trigger', label: '发布触发器' },

  { name: 'deploy_target.read', label: '读取部署目标' },
  { name: 'deploy_target.edit', label: '编辑部署目标' },
  { name: 'deploy_target.create', label: '添加部署目标' },
  { name: 'deploy_target.delete', label: '删除部署目标' },

  { name: 'deploy_request.read', label: '读取部署请求' },
  { name: 'deploy_request.edit', label: '编辑部署请求' },
  { name: 'deploy_request.create', label: '添加部署请求' },
  { name: 'deploy_request.delete', label: '删除部署请求' },
  { name: 'deploy_request.apply', label: '应用部署请求' },

  { name: 'deploy.create_token', label: '创建部署令牌' },

  { name: 'file.read', label: '文件管理-读取文件列表' },
  { name: 'file.edit', label: '文件管理-更新文件' },
  { name: 'file.create', label: '文件管理-创建文件' },
  { name: 'file.delete', label: '文件管理-删除文件' },
]

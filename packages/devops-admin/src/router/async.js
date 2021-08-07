import Layout from '@/layout'

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/development',
    component: Layout,
    redirect: '/development/functions',
    meta: {
      title: '开发控制台', icon: 'example'
    },
    children: [
      {
        path: 'functions',
        component: () => import('@/views/development/functions'),
        name: 'FunctionListPage',
        meta: {
          title: '云函数',
          icon: 'bug',
          permissions: ['function.read']
        }
      },
      {
        path: 'functions/:id',
        component: () => import('@/views/development/function'),
        name: 'FunctionEditorPage',
        hidden: true,
        meta: {
          title: '调试云函数',
          icon: 'bug',
          permissions: ['function.read']
        }
      },
      {
        path: 'function-logs',
        component: () => import('@/views/development/function_logs'),
        name: 'AllFunctionLogs',
        meta: {
          title: '云函数日志',
          icon: 'documentation',
          permissions: ['function.read', 'function.edit', 'function.create', 'function.debug']
        }
      },
      {
        path: 'function-logs/:id',
        component: () => import('@/views/development/function_logs'),
        name: 'FunctionlogsListPage',
        hidden: true,
        meta: {
          title: '云函数日志',
          icon: 'lock',
          permissions: ['function_logs.read', 'function.read', 'function.edit', 'function.create', 'function.debug']
        }
      },
      {
        path: 'triggers/:funcId',
        component: () => import('@/views/development/triggers'),
        name: 'TriggerListPage',
        hidden: true,
        meta: {
          title: '云函数触发器',
          icon: 'lock',
          permissions: ['trigger.read', 'trigger.edit', 'trigger.create', 'trigger.delete']
        }
      }
    ]
  },
  {
    path: '/database',
    component: Layout,
    redirect: '/database/collections',
    meta: {
      title: '数据管理', icon: 'excel', noCache: false
    },
    children: [
      {
        path: 'policies',
        component: () => import('@/views/database/policies'),
        name: 'PoliciesListPage',
        meta: {
          title: '访问策略',
          icon: 'eye',
          noCache: true,
          permissions: ['policy.read']
        }
      },
      {
        path: 'policy',
        component: () => import('@/views/database/policy'),
        name: 'RuleEditorPage',
        hidden: true,
        meta: {
          title: '访问规则编辑',
          icon: 'edit'
        }
      },
      {
        path: 'collections',
        component: () => import('@/views/database/collections'),
        name: 'CollectionManagement',
        meta: {
          title: '集合管理',
          icon: 'example',
          permissions: ['database.manage', 'collections.get', 'collections.createIndex', 'collections.deleteIndex']
        }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    redirect: '/system/role',
    meta: {
      title: '成员管理', icon: 'peoples'
    },
    children: [
      {
        path: 'admin',
        component: () => import('@/views/system/admin'),
        name: 'AdminListPage',
        meta: {
          title: '开发者',
          icon: 'people',
          permissions: ['admin.read']
        }
      },
      {
        path: 'role',
        component: () => import('@/views/system/role'),
        name: 'RoleListPage',
        meta: {
          title: '角色',
          icon: 'user',
          permissions: ['role.edit', 'role.create']
        }
      }
    ]
  },
  {
    path: '/deploy',
    component: Layout,
    redirect: '/deploy/target',
    meta: {
      title: '远程部署', icon: 'guide'
    },
    children: [
      {
        path: 'targets',
        component: () => import('@/views/deploy/targets'),
        name: 'DeployTargetsListPage',
        meta: {
          title: '目标环境',
          icon: 'international',
          noCache: true
          // permissions: ['admin.read']
        }
      },
      {
        path: 'requests',
        component: () => import('@/views/deploy/requests'),
        name: 'DeployRequestsListPage',
        meta: {
          title: '部署请求',
          icon: 'skill',
          noCache: true

          // permissions: ['role.edit', 'role.create']
        }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

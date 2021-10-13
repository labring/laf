import Layout from '@/layout/app.vue'

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/app/:appid/dashboard',
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '欢迎', icon: 'dashboard', affix: true, noCache: true }
      }
    ]
  },
  {
    path: '/app/:appid/cloudfunction',
    component: Layout,
    meta: {
      title: '云函数', icon: 'example'
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/cloudfunction/index'),
        name: 'FunctionListPage',
        meta: {
          title: '云函数',
          icon: 'bug'
        }
      },
      {
        path: 'functions/:id',
        component: () => import('@/views/cloudfunction/debug'),
        name: 'FunctionEditorPage',
        hidden: true,
        meta: {
          title: '调试云函数',
          icon: 'bug'
        }
      },
      {
        path: 'logs',
        component: () => import('@/views/cloudfunction/logs'),
        name: 'AllFunctionLogs',
        meta: {
          title: '云函数日志',
          icon: 'documentation'
        }
      },
      {
        path: 'logs/:id',
        component: () => import('@/views/cloudfunction/logs'),
        name: 'FunctionlogsListPage',
        hidden: true,
        meta: {
          title: '云函数日志',
          icon: 'lock'
        }
      },
      {
        path: 'triggers/:funcId',
        component: () => import('@/views/cloudfunction/triggers'),
        name: 'TriggerListPage',
        hidden: true,
        meta: {
          title: '云函数触发器',
          icon: 'lock'
        }
      }
    ]
  },
  {
    path: '/app/:appid/database',
    component: Layout,
    meta: {
      title: '数据管理', icon: 'excel'
    },
    children: [
      {
        path: 'policies',
        component: () => import('@/views/database/policies'),
        name: 'PoliciesListPage',
        meta: {
          title: '访问策略',
          icon: 'eye',
          noCache: true
        }
      },
      {
        path: 'policies/:id',
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
          noCache: true
        }
      },
      {
        path: 'buckets',
        component: () => import('@/views/database/buckets'),
        name: 'FileBucketListPage',
        meta: {
          title: '文件管理',
          icon: 'zip',
          noCache: true
        }
      },
      {
        path: 'files/:bucket',
        component: () => import('@/views/database/files'),
        name: 'FileListPage',
        hidden: true,
        meta: {
          title: '文件列表',
          icon: 'documentation',
          noCache: false
        }
      }
    ]
  },
  {
    path: '/app/:appid/deploy',
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
  {
    path: '/app/:appid/collaborate',
    component: Layout,
    meta: {
      title: '成员管理',
      icon: 'peoples',
      noCache: true
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/collaborate/index'),
        name: 'CollaboratorListPage',
        meta: {
          title: '成员管理',
          icon: 'people',
          noCache: true
        }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

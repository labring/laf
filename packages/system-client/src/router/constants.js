import Layout from '@/layout'

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/account/sign-in'),
    hidden: true
  },
  {
    path: '/sign-up',
    component: () => import('@/views/account/sign-up'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/applications',
    hidden: true,
    children: [
      {
        path: 'applications',
        component: () => import('@/views/application/index'),
        name: 'Application',
        meta: { title: '我的应用', icon: 'dashboard', noCache: true }
      }
    ]
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

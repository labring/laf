import router from './router'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import store from './store'

import { Message } from 'element-ui'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()

  if (hasToken) {
    if (!store.state.user.name) {
      store.dispatch('user/getInfo')
    }
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done() // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else if (to.path.startsWith('/app/')) {
      console.log('router', to.path)
      if (store.state.app.application) {
        next()
      } else {
        let appid = to.params.appid
        // parse appid manually while refreshing page
        if (!appid) {
          const arr = to.path.split('/')
          appid = arr[2]
        }

        // load the application
        try {
          await store.dispatch('app/loadCurrentApplication', appid)
        } catch (error) {
          console.error(`failed to load application: ${appid}`, error)
          Message('加载应用信息出错，请刷新重试')
          return
        }

        const roles = store.state.app.roles
        const permissions = store.state.app.permissions
        const accessRoutes = await store.dispatch('permission/generateRoutes', { appid, roles, permissions })
        router.addRoutes(accessRoutes)

        // hack method to ensure that addRoutes is complete
        // set the replace: true, so the navigation will not leave a history record
        next({ ...to, replace: true })
      }
    } else {
      next()
    }
  } else {
    /* has no token*/
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})

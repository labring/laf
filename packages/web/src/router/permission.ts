import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import router from '.'
import { getToken } from '~/utils/auth' // get token from cookie
import { useUserStore } from '~/store'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/register'] // no redirect whitelist

router.beforeEach(async (to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = to.meta.title ? `${to.meta.title} - LAF 云开发` : 'LAF 云开发'

  // determine whether the user has logged in
  const hasToken = getToken()
  if (hasToken) {
    const userStore = useUserStore()
    if (!userStore.userProfile?.name)
      await userStore.getUserProfile()

    if (to.path === '/login' || to.path === '/register' || to.path === '/') {
      // if is logged in, redirect to the home page
      next({ path: '/application' })
      NProgress.done() // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    }
    else {
      next()
    }
  }
  else {
    /* has no token */
    if (whiteList.includes(to.path)) {
      // in the free login whitelist, go directly
      next()
    }
    else {
      // other pages that do not have permission to access are redirected to the login page.
      ElMessage.warning('请先登录')
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})

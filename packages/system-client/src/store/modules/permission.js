import { asyncRoutes, constantRoutes } from '@/router'

/**
 * Use meta.permission to determine if the current user has permission
 * @param permissions
 * @param route
 */
function hasPermission(permissions, route) {
  if (route.meta && route.meta.permissions) {
    return permissions.some(perm => route.meta.permissions.includes(perm))
  } else {
    return true
  }
}

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasRole(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, { roles, permissions }) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasRole(roles, tmp) && hasPermission(permissions, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, { roles, permissions })
      }
      res.push(tmp)
    }
  })

  return res
}

/**
 * render appid into routes' path
 * @param {any[]} routes
 * @param {string} appid
 */
function fillAppId2Routes(routes, appid) {
  for (const route of routes) {
    if (route.path.startsWith('/app/:appid/')) {
      route.path = route.path.replace(`/app/:appid/`, `/app/${appid}/`)
    }
  }
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  async generateRoutes({ commit }, { appid, roles, permissions }) {
    const accessedRoutes = filterAsyncRoutes(asyncRoutes, { roles, permissions })
    fillAppId2Routes(accessedRoutes, appid)
    commit('SET_ROUTES', accessedRoutes)
    return accessedRoutes
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

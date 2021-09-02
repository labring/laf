import { getApplicationByAppid } from '@/api/application'
import { assert } from '@/utils/assert'

const state = {
  /**
   * 当前应用对象
   */
  application: null,
  /**
   * 用户在当前应用的角色
   */
  roles: [],
  /**
   * 用户对当前应用的权限
   */
  permissions: []
}

const mutations = {
  SET_APPLICATION: (state, payload) => {
    state.application = payload
  },
  SET_APP_ROLES: (state, payload) => {
    state.roles = payload || []
  },
  SET_APP_PERMISSIONS: (state, payload) => {
    state.permissions = payload || []
  },
  CLEAR_STATE: (state) => {
    state.application = null
    state.roles = []
    state.permissions = []
  }
}

const actions = {
  async loadCurrentApplication({ commit }, appid) {
    const res = await getApplicationByAppid(appid)
    assert(res.data?.application, 'empty `res.data?.application` got')
    assert(res.data?.roles, 'empty `res.data?.roles` got')
    assert(res.data?.permissions, 'empty `res.data?.permissions` got')

    commit('SET_APPLICATION', res.data?.application)
    commit('SET_APP_ROLES', res.data?.roles)
    commit('SET_APP_PERMISSIONS', res.data?.permissions)
  },
  clearStates({ commit }) {
    commit('CLEAR_STATE')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

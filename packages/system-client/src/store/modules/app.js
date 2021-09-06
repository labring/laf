import { getApplicationByAppid } from '@/api/application'
import { assert } from '@/utils/assert'

const state = {
  /**
   * 当前应用对象
   */
  application: null,
  appid: null,

  /**
   * 用户在当前应用的角色
   */
  roles: [],

  /**
   * 用户对当前应用的权限
   */
  permissions: [],

  /**
   * The token of debugging cloud function
   */
  debug_token: null,

  /**
   * The token of file uploading and downloading
   */
  file_token: null
}

const mutations = {
  SET_APPLICATION: (state, payload) => {
    state.application = payload
    state.appid = payload?.appid
  },
  SET_APP_ROLES: (state, payload) => {
    state.roles = payload || []
  },
  SET_APP_PERMISSIONS: (state, payload) => {
    state.permissions = payload || []
  },
  SET_DEBUG_TOKEN: (state, payload) => {
    state.debug_token = payload || []
  },
  SET_FILE_TOKEN: (state, payload) => {
    state.file_token = payload || []
  },
  CLEAR_STATE: (state) => {
    state.application = null
    state.appid = null
    state.roles = []
    state.permissions = []
    state.debug_token = null
    state.file_token = null
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
    commit('SET_DEBUG_TOKEN', res.data?.debug_token)
    commit('SET_FILE_TOKEN', res.data?.file_token)
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

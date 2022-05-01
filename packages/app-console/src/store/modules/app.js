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
  file_token: null,

  /**
   * spec
   * @type {Object}
   */
  spec: null,

  app_deploy_host: null,
  app_deploy_url_schema: 'http',
  storage_deploy_host: null,
  storage_deploy_url_schema: 'http',
  oss_internal_endpoint: null,
  oss_external_endpoint: null
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
  SET_SPEC: (state, spec) => {
    state.spec = spec || {}
  },
  SET_APP_DEPLOY_HOST: (state, domain) => {
    state.app_deploy_host = domain
  },
  SET_APP_DEPLOY_URL_SCHEMA: (state, schema) => {
    state.app_deploy_url_schema = schema
  },
  SET_STORAGE_DEPLOY_HOST: (state, domain) => {
    state.storage_deploy_host = domain
  },
  SET_OSS_EXTERNAL_ENDPOINT: (state, endpoint) => {
    state.oss_external_endpoint = endpoint
  },
  SET_STORAGE_DEPLOY_URL_SCHEMA: (state, schema) => {
    state.storage_deploy_url_schema = schema
  },
  CLEAR_STATE: (state) => {
    state.application = null
    state.appid = null
    state.roles = []
    state.permissions = []
    state.debug_token = null
    state.file_token = null
    state.spec = null
    state.app_deploy_host = null
    state.app_deploy_url_schema = 'http'
    state.storage_deploy_host = null
    state.storage_deploy_url_schema = 'http'
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
    commit('SET_SPEC', res.data?.spec)
    commit('SET_APP_DEPLOY_HOST', res.data?.app_deploy_host)
    commit('SET_APP_DEPLOY_URL_SCHEMA', res.data?.app_deploy_url_schema)
    commit('SET_STORAGE_DEPLOY_HOST', res.data?.storage_deploy_host)
    commit('SET_OSS_EXTERNAL_ENDPOINT', res.data?.oss_external_endpoint)
    commit('SET_STORAGE_DEPLOY_URL_SCHEMA', res.data?.storage_deploy_url_schema)
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

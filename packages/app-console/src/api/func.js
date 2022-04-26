import store from '@/store'
import request from '@/utils/request'
import axios from 'axios'
import { getAppAccessUrl } from './application'

/**
 * Get cloud function list
 * @param {*} query
 * @param {*} page
 * @param {*} pageSize
 */
export function getFunctions(query, page, pageSize) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/function`,
    method: 'get',
    params: {
      ...query,
      page,
      limit: pageSize
    }
  })
}

/**
 * Get published functions by ids
 * @param {string[]} ids
 * @returns
 */
export function getPublishedFunctions(ids) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/function/published`,
    method: 'POST',
    data: {
      ids
    }
  })
}

/**
 * Get published function by id
 * @param {string} id
 * @returns
 */
export async function getPublishedFunction(id) {
  const res = await getPublishedFunctions([id])
  const [func] = res?.data ?? []
  return func
}

/**
 * Get all tags of cloud functions
 */
export function getAllFunctionTags() {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/function/tags/all`,
    method: 'get'
  })
}

/**
 * Get a cloud function
 * @param {*} query
 * @param {*} page
 * @param {*} pageSize
 */
export function getFunctionById(func_id) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/function/${func_id}`,
    method: 'get'
  })
}

/**
 * Create a cloud function
 * @param {string} appid
 * @param {object} function_data
 * @returns
 */
export function createFunction(function_data) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/function/create`,
    method: 'post',
    data: function_data
  })
}

/**
 * Update the basic info of cloud function
 * @param {string} func_id
 * @param {object} function_data
 * @returns
 */
export function updateFunction(func_id, function_data) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/function/${func_id}/info`,
    method: 'post',
    data: function_data
  })
}

/**
 * Update the code of cloud function
 * @param {string} func_id
 * @param {object} function_data
 * @returns
 */
export function updateFunctionCode(func_id, function_data) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/function/${func_id}/code`,
    method: 'post',
    data: function_data
  })
}

/**
 * Remove a cloud function
 * @param {*} func_id
 * @returns
 */
export function removeFunction(func_id) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/function/${func_id}`,
    method: 'delete'
  })
}

/**
 * Publish functions
 */
export function publishFunctions() {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/function/publish`,
    method: 'post'
  })
}

/**
 * Publish one function
 * @param {string} func_id
 */
export function publishOneFunction(func_id) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/function/${func_id}/publish`,
    method: 'post'
  })
}

/**
 * Compile the code of cloud function
 * @param {string} func_id
 * @param {object} function_data
 * @returns
 */
export function compileFunctionCode(func_id, function_data) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/function/${func_id}/compile`,
    method: 'post',
    data: function_data
  })
}

/**
 * Debug cloud function
 */
export async function launchFunction(func, param, debug_token) {
  const app_url = getAppAccessUrl()
  const res = await axios({
    url: app_url + `/debug/${func.name}`,
    method: 'post',
    data: {
      func,
      param
    },
    headers: {
      'Authorization': `Bearer ${debug_token}`
    }
  })

  return res
}

/**
 * 加载依赖包的类型声明文件
 * @param {string} packageName
 * @returns
 */
export async function loadPackageTypings(packageName) {
  const app_url = getAppAccessUrl()
  const res = await axios({
    url: app_url + `/typing/package?packageName=${packageName}`,
    method: 'GET'
  })

  return res.data
}

/**
 * Get cloud function logs
 * @param {*} query
 * @param {*} page
 * @param {*} pageSize
 */
export async function getFunctionLogs(query, page, pageSize) {
  const appid = store.state.app.appid
  const res = await request({
    url: `/apps/${appid}/function/logs/query`,
    method: 'get',
    params: {
      ...query,
      page,
      limit: pageSize
    }
  })

  return res
}

/**
 * Get a cloud function's change history
 * @param {*} page
 * @param {*} pageSize
 */
export function getFunctionChangeHistory(func_id, page = 1, pageSize = 20) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/function/${func_id}/changes`,
    method: 'get',
    params: {
      page,
      limit: pageSize
    }
  })
}

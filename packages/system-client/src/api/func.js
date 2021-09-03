import store from '@/store'
import request from '@/utils/request'

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
 * Delete a cloud function
 * @param {*} func_id
 * @returns
 */
export function deleteFunction(func_id) {
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
 * Debug cloud function
 */
export function launchFunction(functionName, data, debug = false) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/function/debug/${functionName}`,
    method: 'post',
    data: data,
    headers: {
      'debug-token': debug
    }
  })
}

/**
 * 加载依赖包的类型声明文件
 * @param {string} packageName
 * @returns
 */
export function loadPackageTypings(packageName) {
  return request({
    url: `/app/typing/package?packageName=${packageName}`,
    method: 'GET'
  })
}

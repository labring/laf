import request from '@/utils/request'

/**
 * 分页获取云函数列表
 * @param {*} query
 * @param {*} page
 * @param {*} pageSize
 */
export function getFunctions(appid, query, page, pageSize) {
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
 * Create a cloud function
 * @param {string} appid
 * @param {object} function_data
 * @returns
 */
export function createFunction(appid, function_data) {
  return request({
    url: `/apps/${appid}/function/create`,
    method: 'post',
    data: function_data
  })
}

export function updateFunction(appid, function_data) {
  return request({
    url: `/apps/${appid}/function/create`,
    method: 'post',
    data: function_data
  })
}

/**
 * 运行云函数
 */
export function launchFunction(functionName, data, debug = false) {
  return request({
    url: `/app/func/invoke/${functionName}`,
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

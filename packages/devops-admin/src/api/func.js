import request from '@/utils/request'

/**
 * 运行云函数
 */
export function launchFunction(functionName, data, debug = false) {
  return request({
    url: `/app/func/invoke/${functionName}?debug=${debug}`,
    method: 'post',
    data: data
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

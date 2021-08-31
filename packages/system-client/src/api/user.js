import request from '@/utils/request'

/**
 * 管理员登录
 * @param {username: string, password: string} data
 * @returns
 */
export function login(data) {
  return request({
    url: '/admin/login',
    method: 'post',
    data
  })
}

/**
 * 获取管理员信息
 * @param {string} token
 * @returns
 */
export function getInfo() {
  return request({
    url: '/admin/info',
    method: 'get'
  })
}

/**
 * 添加管理员
 */
export function add(data) {
  return request({
    url: '/admin/add',
    method: 'post',
    data
  })
}

/**
 * 编辑管理员
 */
export function edit(data) {
  return request({
    url: '/admin/edit',
    method: 'post',
    data
  })
}

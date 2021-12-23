import request from '@/utils/request'

/**
 * 获取帐户信息
 * @param {string} token
 * @returns
 */
export function getUserProfile() {
  return request({
    url: '/account/profile',
    method: 'get'
  })
}

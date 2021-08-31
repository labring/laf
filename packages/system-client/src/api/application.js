import request from '@/utils/request'

/**
 * 请求我的应用
 * @returns 返回我的应用列表
 */
export function getMyApplications() {
  return request({
    url: '/apps/my',
    method: 'get'
  })
}

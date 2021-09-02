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

/**
 * 根据 appid 获取应用
 * @param {string} appid
 * @returns { Application } 返回应用数据
 */
export async function getApplicationByAppid(appid) {
  const res = await request({
    url: `/apps/${appid}`,
    method: 'get'
  })

  return res
}

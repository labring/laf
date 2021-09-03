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

/**
 * 创建应用
 * @param param0
 * @returns
 */
export async function createApplication({ name }) {
  const res = await request({
    url: `/apps/create`,
    method: 'post',
    data: {
      name
    }
  })
  return res
}

/**
 * 编辑应用
 * @param param0
 * @returns
 */
export async function updateApplication(appid, { name }) {
  const res = await request({
    url: `/apps/${appid}`,
    method: 'post',
    data: {
      name
    }
  })
  return res
}

/**
 * 启动应用服务
 * @param {*} appid
 * @returns
 */
export async function startApplication(appid) {
  const res = await request({
    url: `/apps/${appid}/start`,
    method: 'post'
  })
  return res
}

/**
 * 停止应用服务
 * @param {*} appid
 * @returns
 */
export async function stopApplication(appid) {
  const res = await request({
    url: `/apps/${appid}/stop`,
    method: 'post'
  })
  return res
}

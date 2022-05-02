import { getCurrentBaseURL } from '@/utils'
import { getToken, getTokenExpire } from '@/utils/auth'
import request from '@/utils/request'

/**
 * 请求我的应用
 * @returns 返回我的应用列表
 */
export function getMyApplications() {
  return request({
    url: '/sys-api/apps/my',
    method: 'get'
  })
}

/**
 * Get avaliable specs
 * @returns
 */
export function getSpecs() {
  return request({
    url: '/sys-api/apps/specs',
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
    url: `/sys-api/apps/${appid}`,
    method: 'get'
  })

  return res
}

/**
 * 创建应用
 * @param param0
 * @returns
 */
export async function createApplication({ name, spec }) {
  const res = await request({
    url: `/sys-api/apps/create`,
    method: 'post',
    data: {
      name,
      spec
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
    url: `/sys-api/apps/${appid}`,
    method: 'post',
    data: {
      name
    }
  })
  return res
}

/**
 * 删除（释放）应用
 * @param {*} appid
 * @returns
 */
export async function removeApplication(appid) {
  const res = await request({
    url: `/sys-api/apps/${appid}`,
    method: 'delete'
  })
  return res
}

/**
 * 启动应用服务
 * @param {*} appid
 * @returns
 */
export async function startApplicationInstance(appid) {
  const res = await request({
    url: `/sys-api/apps/${appid}/instance/start`,
    method: 'post'
  })
  return res
}

/**
 * 停止应用服务
 * @param {*} appid
 * @returns
 */
export async function stopApplicationInstance(appid) {
  const res = await request({
    url: `/sys-api/apps/${appid}/instance/stop`,
    method: 'post'
  })
  return res
}

/**
 * 重启应用服务
 * @param {*} appid
 * @returns
 */
export async function restartApplicationInstance(appid) {
  const res = await request({
    url: `/sys-api/apps/${appid}/instance/restart`,
    method: 'post'
  })
  return res
}

/**
 * 导出应用
 * @param {string} appid
 * @returns
 */
export async function exportApplication(appid) {
  const res = await request({
    url: `/sys-api/apps/${appid}/export`,
    method: 'get',
    responseType: 'blob'
  })
  return res
}

/**
 * 导入应用
 * @param {string} appid
 * @param {File} file
 * @returns
 */
export async function importApplication(appid, file) {
  const form = new FormData()
  form.append('file', file)
  const res = await request({
    url: `/sys-api/apps/${appid}/import`,
    method: 'post',
    data: form,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res
}

/**
 * Open app console
 * @param {*} app
 */
export async function openAppConsole(app) {
  const base_url = getCurrentBaseURL()
  const console_uri = process.env.VUE_APP_APP_CONSOLE_URI
  const back_url = encodeURIComponent(window.location.href)

  let app_console_url = `${console_uri}/#/app/${app.appid}/dashboard/index?$back_url=${back_url}`

  // pass auth info when in CORS
  if (console_uri.startsWith('http')) {
    app_console_url = app_console_url + `&access_token=${getToken()}&expire=${getTokenExpire()}&with_auth=true`
  } else {
    app_console_url = base_url + app_console_url
  }

  console.log(app_console_url, 'app_console_url')
  window.open(app_console_url, '_blank')
}

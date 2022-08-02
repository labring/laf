import request from '~/api/request'
import { useAppStore } from '~/store'
import { getCurrentBaseURL } from '~/utils'
import { getToken, getTokenExpire } from '~/utils/auth'

/**
 * 请求我的应用
 * @returns my application list
 */
export function getMyApplications() {
  return request({
    url: '/sys-api/apps/my',
    method: 'get',
  })
}

/**
 * Get avaliable specs
 * @returns
 */
export function getSpecs() {
  return request({
    url: '/sys-api/apps/specs',
    method: 'get',
  })
}

/**
 * Get application by appid
 * @param {string} appid
 * @returns { Application } Application Data
 */
export async function getApplicationByAppid(appid: string) {
  const res = await request({
    url: `/sys-api/apps/${appid}`,
    method: 'get',
  })

  return res
}

/**
 * Create Application
 * @param param0
 * @returns
 */
export async function createApplication(data: { name: string; spec: string }) {
  const res = await request({
    url: '/sys-api/apps/create',
    method: 'post',
    data,
  })
  return res
}

/**
 * Edit Application
 * @param param0
 * @returns
 */
export async function updateApplication({ appid, name }: {
  appid: string
  name: string
}) {
  const res = await request({
    url: `/sys-api/apps/${appid}`,
    method: 'post',
    data: {
      name,
    },
  })
  return res
}

/**
 * Delete (Release) Application
 * @param {*} appid
 * @returns
 */
export async function removeApplication(appid: string) {
  const res = await request({
    url: `/sys-api/apps/${appid}`,
    method: 'delete',
  })
  return res
}

/**
 * 启动应用服务
 * @param {*} appid
 * @returns
 */
export async function startApplicationInstance(appid: string) {
  const res = await request({
    url: `/sys-api/apps/${appid}/instance/start`,
    method: 'post',
  })
  return res
}

/**
 * 停止应用服务
 * @param {*} appid
 * @returns
 */
export async function stopApplicationInstance(appid: string) {
  const res = await request({
    url: `/sys-api/apps/${appid}/instance/stop`,
    method: 'post',
  })
  return res
}

/**
 * 重启应用服务
 * @param {*} appid
 * @returns
 */
export async function restartApplicationInstance(appid: string) {
  const res = await request({
    url: `/sys-api/apps/${appid}/instance/restart`,
    method: 'post',
  })
  return res
}

/**
 * 导出应用
 * @param {string} appid
 * @returns
 */
export async function exportApplication(appid: string) {
  const res = await request({
    url: `/sys-api/apps/${appid}/export`,
    method: 'get',
    responseType: 'blob',
  })
  return res
}

/**
 * 导入应用
 * @param {string} appid
 * @param {File} file
 * @returns
 */
export async function importApplication(appid: string, file: string | Blob) {
  const form = new FormData()
  form.append('file', file)
  const res = await request({
    url: `/sys-api/apps/${appid}/import`,
    method: 'post',
    data: form,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res
}

/**
 * Init application with template id
 * @param {string} appid
 * @param {File} file
 * @returns
 */
export async function initApplicationWithTemplate(appid: string, template_id: any) {
  const res = await request({
    url: `/sys-api/apps/${appid}/init-with-template`,
    method: 'post',
    data: {
      template_id,
    },
  })
  return res
}

/**
 * Open app console
 * @param {*} app
 */
export async function openAppConsole(app: { appid: string }) {
  const base_url = getCurrentBaseURL()
  const console_uri = import.meta.env.VITE_APP_CONSOLE_URI
  const back_url = encodeURIComponent(window.location.href)

  let app_console_url = `${console_uri}/#/app/${app.appid}/dashboard/index?$back_url=${back_url}`

  // pass auth info when in CORS
  if (console_uri.startsWith('http')) {
    app_console_url
      = `${app_console_url
      }&access_token=${getToken()}&expire=${getTokenExpire()}&with_auth=true`
  }
  else {
    app_console_url = base_url + app_console_url
  }

  window.open(app_console_url, '_blank')
}

/**
 * 获取当前应用的访问地址
 * @param {*} appid default is current appid
 * @returns
 */
export function getAppAccessUrl() {
  const appStore = useAppStore()
  const appid = appStore.currentApp.appid
  const domain = appStore.appDeployHost
  const schema = appStore.appDeployUrlSchema || 'http'
  const url = `${schema}://${appid}.${domain}`
  return url
}

/**
 * 获取应用的依赖
 * @param {*} appid
 * @returns
 */
export async function getApplicationPackages(appid: string) {
  const res = await request({
    url: `/sys-api/apps/${appid}/packages`,
    method: 'get',
  })
  return res
}

/**
 * 添加应用的依赖
 * @param {*} appid
 * @returns
 */
export async function addApplicationPackage(appid: string, { name, version }: any): Promise<any> {
  const res = await request({
    url: `/sys-api/apps/${appid}/packages`,
    method: 'post',
    data: { name, version },
  })
  return res
}

/**
 * 更新应用的依赖
 * @param {*} appid
 * @returns
 */
export async function updateApplicationPackage(appid: string, { name, version }: any): Promise<any> {
  const res = await request({
    url: `/sys-api/apps/${appid}/packages`,
    method: 'put',
    data: { name, version },
  })
  return res
}

/**
 * 删除应用的依赖
 * @param {*} appid
 * @returns
 */
export async function removeApplicationPackage(appid: string, name: any): Promise<any> {
  const res = await request({
    url: `/sys-api/apps/${appid}/packages`,
    method: 'delete',
    data: { name },
  })
  return res
}

/**
 * 获取应用的协作者列表
 * @param {string} username
 */
export function getCollaborators(): Promise<any> {
  const appStore = useAppStore()

  const appid = appStore.currentApp.appid
  return request({
    url: `/sys-api/apps/${appid}/collaborators`,
    method: 'get',
  })
}

/**
 * 删除应用的一个协作者
 * @param {string} collaborator_id
 */
export function removeCollaborator(collaborator_id: any): Promise<any> {
  const appStore = useAppStore()

  const appid = appStore.currentApp.appid
  return request({
    url: `/sys-api/apps/${appid}/collaborators/${collaborator_id}`,
    method: 'delete',
  })
}

/**
 * 更新协作者密码(TBD)
 * @param {string} accountId
 * @param {string} password
 */
export function resetAccountPassword(accountId: any, password: any): Promise<any> {
  return request({
    url: '/account/resetPassword',
    method: 'post',
    data: {
      accountId,
      password,
    },
  })
}

/**
 * 添加协作成员
 * @param {member_id, roles}
 * @returns
 */
export async function inviteCollaborator(member_id: any, roles: any): Promise<any> {
  const appStore = useAppStore()

  const appid = appStore.currentApp.appid
  const res = await request({
    url: `/sys-api/apps/${appid}/invite`,
    method: 'post',
    data: {
      member_id,
      roles,
    },
  })
  return res
}

/**
 * 获取所有应用角色
 * @param {string} username
 */
export function getAllApplicationRoles() {
  return request({
    url: '/sys-api/apps/collaborators/roles',
    method: 'get',
  })
}

/**
 * 根据用户名搜索用户
 * @param {string} username
 */
export function searchUserByUsername(username: any) {
  return request({
    url: '/sys-api/apps/collaborators/search',
    method: 'post',
    data: {
      username,
    },
  })
}


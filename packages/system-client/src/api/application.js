import store from '@/store'
import request from '@/utils/request'

/**
 * 获取应用的协作者列表
 * @param {string} username
 */
export function getCollaborators() {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/collaborators`,
    method: 'get'
  })
}

/**
 * 删除应用的一个协作者
 * @param {string} collaborator_id
 */
export function removeCollaborator(collaborator_id) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/collaborators/${collaborator_id}`,
    method: 'delete'
  })
}

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
 * 添加协作成员
 * @param {member_id, roles}
 * @returns
 */
export async function inviteCollaborator(member_id, roles) {
  const appid = store.state.app.appid
  const res = await request({
    url: `/apps/${appid}/invite`,
    method: 'post',
    data: {
      member_id,
      roles
    }
  })
  return res
}

/**
 * 获取所有应用角色
 * @param {string} username
 */
export function getAllApplicationRoles() {
  return request({
    url: '/apps/collaborators/roles',
    method: 'get'
  })
}

/**
 * 根据用户名搜索用户
 * @param {string} username
 */
export function searchUserByUsername(username) {
  return request({
    url: '/apps/collaborators/search',
    method: 'post',
    data: {
      username
    }
  })
}

/**
 * 启动应用服务
 * @param {*} appid
 * @returns
 */
export async function startApplicationService(appid) {
  const res = await request({
    url: `/apps/${appid}/service/start`,
    method: 'post'
  })
  return res
}

/**
 * 停止应用服务
 * @param {*} appid
 * @returns
 */
export async function stopApplicationService(appid) {
  const res = await request({
    url: `/apps/${appid}/service/stop`,
    method: 'post'
  })
  return res
}

/**
 * 删除应用服务
 * @param {*} appid
 * @returns
 */
export async function removeApplicationService(appid) {
  const res = await request({
    url: `/apps/${appid}/service/remove`,
    method: 'post'
  })
  return res
}

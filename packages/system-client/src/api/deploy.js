import store from '@/store'
import request from '@/utils/request'
import axios from 'axios'

/**
 * Get deploy targets
 * @returns
 */
export function getDeployTargets() {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/deploy/targets`,
    method: 'get'
  })
}

/**
 * Create a deploy target
 * @returns
 */
export function createDeployTarget(data) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/deploy/targets/create`,
    method: 'post',
    data: data
  })
}

/**
 * Update a deploy target
 * @returns
 */
export function updateDeployTarget(target_id, data) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/deploy/targets/${target_id}`,
    method: 'post',
    data: data
  })
}

/**
 * Remove a deploy target
 * @returns
 */
export function removeDeployTarget(target_id) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/deploy/targets/${target_id}`,
    method: 'delete'
  })
}

/**
 * 创建部署令牌
 * @param {string[]} permissions 令牌权限: "policy" , "function"
 * @param {number} expire 过期时间，单位是小时
 * @param {string} source 标识部署来源名称
 * @returns
 */
export function createDeployToken({ permissions, expire, source }) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/deploy/create-token`,
    method: 'post',
    data: {
      permissions,
      expire,
      source
    }
  })
}

/**
 * 部署访问策略
 */
export async function deploy2remote(deploy_url, deploy_token, { policies, functions, comment, triggers }) {
  const _data = {
    deploy_token,
    policies: policies,
    functions: functions,
    triggers: triggers,
    comment
  }
  const res = await axios.post(deploy_url, _data)
  return res.data
}

/**
 * Get deploy requests
 * @returns
 */
export function getDeployRequests(query, page, pageSize) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/deploy/requests`,
    method: 'get',
    data: {
      ...query,
      page,
      limit: pageSize
    }
  })
}

/**
 * Remove a deploy request
 * @returns
 */
export function removeDeployRequest(id) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/deploy/requests/${id}`,
    method: 'delete'
  })
}

/**
 * Apply deploy request
 * @param {string} id  the id of deploy request
 * @returns
 */
export function applyDeployRequest(id) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/deploy/requests/${id}/apply`,
    method: 'post'
  })
}

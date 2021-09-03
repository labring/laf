import store from '@/store'
import request from '@/utils/request'

/**
 * Get policy list
 * @param {*} query
 * @param {*} page
 * @param {*} pageSize
 */
export function getPolicies(query, page, pageSize) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/policy`,
    method: 'get',
    params: {
      ...query,
      page,
      limit: pageSize
    }
  })
}

/**
 * Get a policy
 * @param {*} query
 * @param {*} page
 * @param {*} pageSize
 */
export function getPolicyById(policy_id) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/policy/${policy_id}`,
    method: 'get'
  })
}

/**
 * Create a policy
 * @param {string} appid
 * @param {object} data
 * @returns
 */
export function createPolicy(data) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/policy/create`,
    method: 'post',
    data: data
  })
}

/**
 * Update a policy
 * @param {*} policy_id
 * @param {*} data
 * @returns
 */
export function updatePolicy(policy_id, data) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/policy/${policy_id}/info`,
    method: 'post',
    data: data
  })
}

/**
 * Delete a policy
 * @param {*} policy_id
 * @param {*} data
 * @returns
 */
export function deletePolicy(policy_id) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/policy/${policy_id}`,
    method: 'delete'
  })
}

/**
 * Publish policies
 */
export function publishPolicies() {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/policy/publish`,
    method: 'post'
  })
}

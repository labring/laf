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
 * Update policy rules
 * @param {*} policy_id
 * @param {*} rules
 * @returns
 */
export function updatePolicyRules(policy_id, rules) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/policy/${policy_id}/rules`,
    method: 'post',
    data: {
      rules: rules
    }
  })
}

/**
 * Remove a policy
 * @param {*} policy_id
 * @returns
 */
export function removePolicy(policy_id) {
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

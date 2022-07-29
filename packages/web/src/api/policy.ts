import request from '~/api/request'
import { useAppStore } from '~/store'

const appStore = useAppStore()

/**
 * Get policy list
 * @param {*} query
 * @param {*} page
 * @param {*} pageSize
 */
export function getPolicies(query: {}, page: number, pageSize: number) {
  const appid = appStore.currentApp.appid
  return request({
    url: `/apps/${appid}/policy`,
    method: 'get',
    params: {
      ...query,
      page,
      limit: pageSize,
    },
  })
}

/**
 * Get a policy
 * @param {*} query
 * @param {*} page
 * @param {*} pageSize
 */
export function getPolicyById(policy_id: any) {
  const appid = appStore.currentApp.appid
  return request({
    url: `/apps/${appid}/policy/${policy_id}`,
    method: 'get',
  })
}

/**
 * Create a policy
 * @param {string} appid
 * @param {object} data
 * @returns
 */
export function createPolicy(data: any): Promise<any> {
  const appid = appStore.currentApp.appid
  return request({
    url: `/apps/${appid}/policy/create`,
    method: 'post',
    data,
  })
}

/**
 * Update a policy
 * @param {*} policy_id
 * @param {*} data
 * @returns
 */
export function updatePolicy(policy_id: undefined, data: { name: string; label: any; injector: null; status: number; description: string }): Promise<any> {
  const appid = appStore.currentApp.appid
  return request({
    url: `/apps/${appid}/policy/${policy_id}/info`,
    method: 'post',
    data,
  })
}

/**
 * Update policy rules
 * @param {*} policy_id
 * @param {*} rules
 * @returns
 */
export function updatePolicyRules(policy_id: any, rules: any) {
  const appid = appStore.currentApp.appid
  return request({
    url: `/apps/${appid}/policy/${policy_id}/rules`,
    method: 'post',
    data: {
      rules,
    },
  })
}

/**
 * Remove a policy
 * @param {*} policy_id
 * @returns
 */
export function removePolicy(policy_id: any): Promise<any> {
  const appid = appStore.currentApp.appid
  return request({
    url: `/apps/${appid}/policy/${policy_id}`,
    method: 'delete',
  })
}

/**
 * Publish policies
 */
export function publishPolicies(): Promise<any> {
  const appid = appStore.currentApp.appid
  return request({
    url: `/apps/${appid}/policy/publish`,
    method: 'post',
  })
}

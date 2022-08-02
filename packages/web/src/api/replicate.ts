import request from '~/api/request'
import { useAppStore } from '~/store'

const appStore = useAppStore()

/**
 * Get replicated auths
 * @returns
 */
export function getReplicateAuths(): Promise<any> {
  const appid = appStore.currentApp.appid
  return request({
    url: `/sys-api/apps/${appid}/replicate/replicate_auth`,
    method: 'get',
  })
}

/**
 * Create a replicated auth
 *
 * @returns
 */
export function createReplicateAuth(target_appid: any): Promise<any> {
  const appid = appStore.currentApp.appid
  return request({
    url: `/sys-api/apps/${appid}/replicate/replicate_auth`,
    method: 'put',
    data: {
      target_appid,
    },
  })
}

/**
 * Accept a replicated auth
 * @returns
 */
export function acceptReplicateAuth(auth_id: any): Promise<any> {
  const appid = appStore.currentApp.appid
  return request({
    url: `/sys-api/apps/${appid}/replicate/replicate_auth/${auth_id}`,
    method: 'post',
  })
}

/**
 * Remove a replicated auth
 * @param {string} auth_id
 * @returns
 */
export function deleteReplicateAuth(auth_id: any): Promise<any> {
  const appid = appStore.currentApp.appid
  return request({
    url: `/sys-api/apps/${appid}/replicate/replicate_auth/${auth_id}`,
    method: 'delete',
  })
}

/**
 * get replicate requests
 * @returns
 */
export function getReplicateRequests(params: any): Promise<any> {
  const appid = appStore.currentApp.appid
  return request({
    url: `/sys-api/apps/${appid}/replicate/replicate_request`,
    method: 'get',
    params,
  })
}

/**
 * create a replicate request
 * @param {string} target_appid
 * @param {object} functions
 * @param {object} policies
 * @returns
 */
export function createReplicateRequest({ target_appid, functions, policies }: any): Promise<any> {
  const appid = appStore.currentApp.appid
  return request({
    url: `/sys-api/apps/${appid}/replicate/replicate_request`,
    method: 'post',
    data: {
      target_appid,
      functions,
      policies,
    },
  })
}

/**
 * accept a replicate request
 * @param {string} auth_id
 * @returns
 */
export function acceptReplicateRequest(request_id: any, status: any): Promise<any> {
  const appid = appStore.currentApp.appid
  return request({
    url: `/sys-api/apps/${appid}/replicate/replicate_request/${request_id}`,
    method: 'put',
    data: {
      status,
    },
  })
}

/**
 * delete a replicate request
 * @param {string} request_id
 * @returns
 */
export function deleteReplicateRequest(request_id: any): Promise<any> {
  const appid = appStore.currentApp.appid
  return request({
    url: `/sys-api/apps/${appid}/replicate/replicate_request/${request_id}`,
    method: 'delete',
  })
}

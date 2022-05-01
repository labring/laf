import store from '@/store'
import request from '@/utils/request'
import axios from 'axios'

/**
 * Get replicated auths
 * @returns
 */
export function getReplicateAuths() {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/replicate/replicate_auth`,
    method: 'get'
  })
}

/**
 * Create a replicated auth
 * 
 * @returns
 */
export function createReplicateAuth(target_appid) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/replicate/replicate_auth`,
    method: 'put',
    data: {
      target_appid
    }
  })
}

/**
 * Update a replicated auth
 * @returns
 */
export function updateReplicateAuth(auth_id, status) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/replicate/replicate_auth/${auth_id}`,
    method: 'post',
    data: {
      status
    }
  })
}

/**
 * Remove a replicated auth
 * @param {string} auth_id
 * @returns
 */
export function deleteReplicateAuth(auth_id) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/replicate/replicate_auth/${auth_id}`,
    method: 'delete'
  })
}

/**
 * apply a replicated auth
 * @param {string} target_appid
 * @param {object} functions
 * @param {object} policies
 * @returns
 */
export function applyReplicateAuth({ target_appid, functions, policies }) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/replicate/replicas`,
    method: 'put',
    data: {
      target_appid,
      functions,
      policies
    }
  })
}

/**
 * accept a replicated auth
 * @param {string} auth_id
 * @returns
 */
export function acceptReplicateAuth(auth_id) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/replicate/replicas/${auth_id}`,
    method: 'put'
  })
}
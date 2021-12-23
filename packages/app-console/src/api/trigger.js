import store from '@/store'
import request from '@/utils/request'

/**
 * Create a trigger
 * @param {string} func_id
 * @param {object} function_data
 * @returns
 */
export function createTrigger(func_id, trigger_data) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/function/${func_id}/triggers/create`,
    method: 'post',
    data: trigger_data
  })
}

/**
 * Update a trigger
 * @param {string} func_id
 * @param {object} function_data
 * @returns
 */
export function updateTrigger(func_id, trigger_id, trigger_data) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/function/${func_id}/triggers/${trigger_id}`,
    method: 'post',
    data: trigger_data
  })
}

/**
 * Remove a trigger
 * @param {string} func_id
 * @param {object} function_data
 * @returns
 */
export function removeTrigger(func_id, trigger_id) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/function/${func_id}/triggers/${trigger_id}`,
    method: 'delete'
  })
}

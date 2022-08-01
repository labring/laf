import request from '~/api/request'
import { useAppStore } from '~/store'

const appStore = useAppStore()

/**
 * Create a trigger
 * @param {string} func_id
 * @param {object} function_data
 * @returns
 */
export function createTrigger(func_id: string, trigger_data: any): Promise<any> {
  const appid = appStore.currentApp.appid
  return request({
    url: `/sys-api/apps/${appid}/function/${func_id}/triggers/create`,
    method: 'post',
    data: trigger_data,
  })
}

/**
 * Update a trigger
 * @param {string} func_id
 * @param {object} function_data
 * @returns
 */
export function updateTrigger(func_id: string, trigger_id: string, trigger_data: any): Promise<any> {
  const appid = appStore.currentApp.appid
  return request({
    url: `/sys-api/apps/${appid}/function/${func_id}/triggers/${trigger_id}`,
    method: 'post',
    data: trigger_data,
  })
}

/**
 * Remove a trigger
 * @param {string} func_id
 * @param {object} function_data
 * @returns
 */
export function removeTrigger(func_id: string, trigger_id: string): Promise<any> {
  const appid = appStore.currentApp.appid
  return request({
    url: `/sys-api/apps/${appid}/function/${func_id}/triggers/${trigger_id}`,
    method: 'delete',
  })
}

import request from '@/utils/request'

/**
 * 应用所有触发器调度
 */
export function applyTriggers() {
  return request({
    url: `/admin/apply/triggers`,
    method: 'post'
  })
}

/**
 * 应用一个触发器调度
 * @param {String} triggerId 触发器ID
 * @returns
 */
export function applyTrigger(triggerId) {
  return request({
    url: `/admin/apply/triggers?tid=${triggerId}`,
    method: 'post'
  })
}

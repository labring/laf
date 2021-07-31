import request from '@/utils/request'

/**
 * 发布访问策略
 */
export function publishPolicy() {
  return request({
    url: '/publish/policy',
    method: 'post'
  })
}

/**
 * 发布云函数
 */
export function publishFunctions() {
  return request({
    url: '/publish/functions',
    method: 'post'
  })
}

/**
 * 发布触发器
 */
export function publishTriggers(triggerId) {
  if (triggerId) {
    return request({
      url: `/publish/triggers?tid=${triggerId}`,
      method: 'post'
    })
  }

  return request({
    url: '/publish/triggers',
    method: 'post'
  })
}

import request from '@/utils/request'

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

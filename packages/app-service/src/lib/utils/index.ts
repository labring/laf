/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-10-06 19:02:28
 * @Description: 
 */

import { ActionType } from "database-proxy"

/**
 * Convert ActionType to a shorthand string
 * @param action 
 * @returns 
 */
export function convertActionType(action: ActionType) {
  switch (action) {
    case ActionType.READ:
      return 'read'
    case ActionType.ADD:
      return 'add'
    case ActionType.REMOVE:
      return 'remove'
    case ActionType.UPDATE:
      return 'update'
    case ActionType.COUNT:
      return 'count'
    case ActionType.WATCH:
      return 'watch'
    default:
  }

  throw new Error('Unknown action type')
}
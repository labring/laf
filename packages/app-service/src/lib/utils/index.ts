/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-18 16:43:57
 * @Description: 
 */

import { ActionType } from "less-api/dist"

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
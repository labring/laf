import { ActionType } from "less-api/dist"

/**
 * 将 ActionType 转为简写字符串
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
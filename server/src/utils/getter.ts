import { Condition } from 'src/region/cluster/types'
import { ServerConfig } from '../constants'

/**
 * Get system namespace of laf (in kubernetes)
 * @returns
 */
export function GetSystemNamespace(): string {
  return ServerConfig.SYSTEM_NAMESPACE
}

/**
 * Get application namespace name by appid (in kubernetes)
 * @param appid
 * @returns
 */
export function GetApplicationNamespaceById(appid: string): string {
  return appid
}

export function isConditionTrue(type: string, conditions: Condition[] | any[]) {
  if (!conditions) return false

  for (const condition of conditions) {
    if (condition.type === type) {
      return condition.status === 'True'
    }
  }
  return false
}

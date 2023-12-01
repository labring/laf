import { Condition } from 'src/region/cluster/types'
import { ApplicationNamespaceMode, Region } from 'src/region/entities/region'
import { IRequest } from './interface'

/**
 * Get application namespace name by appid (in kubernetes)
 * @param appid
 * @returns
 */
export function GetApplicationNamespace(region: Region, appid: string) {
  const conf = region.namespaceConf
  if (conf?.mode === ApplicationNamespaceMode.Fixed) {
    return conf.fixed
  }

  if (conf?.mode === ApplicationNamespaceMode.AppId) {
    const prefix = conf?.prefix || ''
    return `${prefix}${appid}`
  }

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

export function GetClientIPFromRequest(req: IRequest) {
  // try to get ip from x-forwarded-for
  const ips_str = req.headers['x-forwarded-for'] as string
  if (ips_str) {
    const ips = ips_str.split(',')
    return ips[0]
  }

  // try to get ip from x-real-ip
  const ip = req.headers['x-real-ip'] as string
  if (ip) {
    return ip
  }

  return null
}

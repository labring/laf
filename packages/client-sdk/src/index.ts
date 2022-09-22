/**
 * hack `process` missing for wechat miniprogram
 */
declare const wx: any
if (wx && !process) {
  (globalThis as any).process = {
    env: {}
  }
  console.info('hacked for `process` missing for wechat miniprogram')
}

import { Cloud, Db, } from './cloud'
import { CloudOptions } from './types'

export * from './request'
export * from './types'

function init(config: CloudOptions): Cloud {
  return new Cloud(config)
}

export {
  init,
  Cloud,
  Db,
}
/**
 * set `globalThis` trickily
 */
;((t) => {
  function setGlobalThis() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const globalObj = this
    globalObj.globalThis = globalObj
    // @ts-ignore
    delete t.prototype._T_
  }

  if (typeof globalThis !== 'object') {
    if (this) {
      setGlobalThis()
    } else {
      Object.defineProperty(t.prototype, '_T_', {
        configurable: true,
        get: setGlobalThis,
      })
      // @ts-ignore
      _T_
    }
  }
})(Object)

/**
 * hack `process` missing for wechat miniprogram
 */
if (globalThis.wx && !globalThis.process) {
  ;(globalThis as any).process = {
    env: {},
  }
  console.info('hacked for `process` missing for wechat miniprogram')
}

import { Cloud, Db } from './cloud'
import { CloudOptions } from './types'

export * from './request'
export * from './types'

function init(config: CloudOptions): Cloud {
  return new Cloud(config)
}

export { init, Cloud, Db }

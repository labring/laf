import { Cloud, Db,  } from './cloud'
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
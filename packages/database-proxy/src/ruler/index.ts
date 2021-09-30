
import { Ruler as RulerV1 } from './ruler_v1'
import { Ruler as RulerV2 } from './ruler_v2'

export * from '../policy/interface'

/**
 * Ruler 为别名，为了兼容老版本应用，新版本中都使用 Policy
 */
export { RulerV1, RulerV2, RulerV2 as Ruler }

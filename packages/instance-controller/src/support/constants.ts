
/** prefix of sys db collection name */
const coll_prefix = 'sys_'

export const KB = 1024
export const MB = 1024 * KB
export const GB = 1024 * MB
export const TB = 1024 * GB
export const DATE_NEVER = new Date('2099/12/31')

/** regex const */
export const REGEX_BUCKET_NAME = /^[a-z0-9]{1,16}$/


/** collection names of sys db */
const _ = (cn: string) => coll_prefix + cn
export const CN_APPLICATIONS = _('applications')
export const CN_APP_TEMPLATES = _('app_templates')
export const CN_SPECS = _('specs')
export const CN_APP_SPECS = _('app_specs')

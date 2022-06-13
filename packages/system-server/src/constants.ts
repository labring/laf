/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2022-01-19 15:57:36
 * @Description:
 */

import { deepFreeze } from './support/util-lang'

/** prefix of sys db collection name */
const coll_prefix = 'sys_'

export const KB = 1024
export const MB = 1024 * KB
export const GB = 1024 * MB
export const TB = 1024 * GB
export const DATE_NEVER = new Date('2099/12/31')

export const BUCKET_QUOTA_MIN = 1 * GB

/** regex const */
export const REGEX_BUCKET_NAME = /^[a-z0-9]{1,16}$/
export const REGEX_DOMAIN = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/

/** collection name of cloud functions published to app db */
export const CN_PUBLISHED_FUNCTIONS = '__published__functions'
/** collection name of triggers published to app db */
export const CN_PUBLISHED_TRIGGERS = '__published__triggers'
/** collection name of policies published to app db */
export const CN_PUBLISHED_POLICIES = '__published__policies'
/** collection name of config to app db */
export const CN_PUBLISHED_CONFIG = '__config__'

/** collection names of sys db */
const _ = (cn: string) => coll_prefix + cn
export const CN_ACCOUNTS = _('accounts')
export const CN_POLICIES = _('policies')
export const CN_FUNCTIONS = _('functions')
export const CN_FUNCTION_HISTORY = _('function_history')
export const CN_DEPLOY_TARGETS = _('deploy_targets')
export const CN_DEPLOY_REQUESTS = _('deploy_requests')
export const CN_APPLICATIONS = _('applications')
export const CN_ROUTES = _('routes')
export const CN_RECYCLES = _('recycles')
export const CN_APP_TEMPLATES = _('app_templates')
export const CN_SPECS = _('specs')
export const CN_APP_SPECS = _('app_specs')
export const CN_REPLICATE_AUTH = _('replicate_auth')
export const CN_REPLICATE_REQUESTS = _('replicate_requests')
export const CN_OSS_SERVICE_ACCOUNT = _('oss_service_account')
export const CN_WEBSITE_HOSTING = _('website_hosting')

/** RESPONSE ERROR CODE */
export const RESP_INVALID_BUCKET_NAME = deepFreeze({ code: 'INVALID_BUCKET_NAME', error: 'INVALID_BUCKET_NAME' })
import { Router } from 'express'
import { Entry, MongoAccessor, Ruler } from 'less-api'
import Config from '../config'
import { getPermissions } from '../lib/api/permission'
import { scheduler } from '../lib/faas'
import { getLogger } from '../lib/logger'
import { getAccessRules } from '../lib/rules'

const router = Router()

const accessor = new MongoAccessor(Config.db.database, Config.db.uri, {
  poolSize: Config.db.poolSize,
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const ruler = new Ruler(accessor)
accessor.init()
  .then(() => {
    return getAccessRules('admin', accessor)
  })
  .then(rules => {
    ruler.load(rules)
  })

export const entry = new Entry(accessor, ruler)
entry.setLogger(getLogger('admin:less-api', 'warning'))

const logger = getLogger('admin:entry')
router.post('/entry', async (req, res) => {
  const requestId = req['requestId']
  const auth = req['auth'] ?? {}

  if (!auth.uid) {
    return res.status(401).send()
  }

  const { permissions, roles } = await getPermissions(auth.uid)

  // parse params
  const params = entry.parseParams({ ...req.body, requestId })

  const injections = {
    $uid: auth.uid,
    $roles: roles,
    $perms: permissions,
    $has: (perm_name: string) => {
      return permissions.includes(perm_name)
    },
    $is: (role_name: string) => {
      return roles.includes(role_name)
    }
  }
  // validate query
  const result = await entry.validate(params, injections)
  if (result.errors) {
    logger.debug(`[${requestId}] validate return errors: `, result.errors)
    return res.status(403).send({
      code: 'permission denied',
      error: result.errors,
      injections: Config.isProd ? undefined : injections
    })
  }

  // execute query
  try {
    const data = await entry.execute(params)
    logger.trace(`[${requestId}] executed query: `, data)

    // 触发数据事件
    const event = `/db/${params.collection}/${params.action}`
    scheduler.emit(event, data)

    return res.send({
      code: 0,
      data
    })
  } catch (error) {
    return res.send({
      code: 2,
      error: error.toString(),
      injections: Config.isProd ? undefined : injections
    })
  }
})

export default router
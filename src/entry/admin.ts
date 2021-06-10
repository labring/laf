import { Router } from 'express'
import { Entry, Ruler } from 'less-api'
import Config from '../config'
import { getPermissions } from '../lib/api/permission'
import { accessor } from '../lib/db'
import { getLogger } from '../lib/logger'
import { getAccessRules } from '../lib/rules'

const logger = getLogger('admin:entry')
const router = Router()

const ruler = new Ruler(accessor)
accessor.ready.then(async () => {
  const rules = await getAccessRules('admin', accessor)
  ruler.load(rules)
})

export const entry = new Entry(accessor, ruler)

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
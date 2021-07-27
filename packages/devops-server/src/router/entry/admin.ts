import { Router } from 'express'
import { Entry, Ruler } from 'less-api'
import Config from '../../config'
import { getPermissions } from '../../api/permission'
import { Globals } from '../../lib/globals'

import sys_rules from './sys_rules'

export const DevOpsEntryRouter = Router()

const logger = Globals.logger
const accessor = Globals.sys_accessor

const ruler = new Ruler(accessor)
ruler.load(sys_rules)


/**
 * Sys Db Access Entry
 */
DevOpsEntryRouter.post('/entry', async (req, res) => {
  const requestId = req['requestId']
  const auth = req['auth'] ?? {}

  if (!auth.uid) {
    return res.status(401).send()
  }

  const { permissions, roles } = await getPermissions(auth.uid)

  // parse params
  const entry = new Entry(accessor, ruler)
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
    logger.debug(requestId, `validate return errors: `, result.errors)
    return res.status(403).send({
      code: 'permission denied',
      error: result.errors,
      injections: Config.isProd ? undefined : injections
    })
  }

  // execute query
  try {
    const data = await entry.execute(params)
    logger.trace(requestId, `executed query: `, data)

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
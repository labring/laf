/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-17 17:21:08
 * @Description: 
 */

import { Router } from 'express'
import { logger } from '../lib/logger'
import { Proxy, Policy } from 'less-api'
import Config from '../config'
import { getPermissions } from '../api/permission'
import { DatabaseAgent } from '../lib/db-agent'

import sys_rules from './sys_rules'

export const DevOpsEntryRouter = Router()

const accessor = DatabaseAgent.sys_accessor

const policy = new Policy(accessor)
policy.load(sys_rules)


/**
 * The less-api proxy entry for sys db served for `devops admin client`
 */
DevOpsEntryRouter.post('/entry', async (req, res) => {
  const requestId = req['requestId']
  const auth = req['auth'] ?? {}

  if (!auth.uid) {
    return res.status(401).send()
  }

  const { permissions, roles } = await getPermissions(auth.uid)

  // parse params
  const entry = new Proxy(accessor, policy)
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
      code: 1,
      error: error.toString(),
      injections: Config.isProd ? undefined : injections
    })
  }
})
import { Router } from 'express'
import { Entry, MysqlAccessor } from 'less-api'
import Config from '../config'
import assert = require('assert')
import { db } from '../lib/db'


const rules = require('../rules/admin.json')

const router = Router()

router.all('*', async function (_req, _res, next) {
  next()
})
const accessor = new MysqlAccessor(Config.db)
const entry = new Entry(accessor)
entry.init()
entry.loadRules(rules)

router.post('/entry', async (req, res) => {
  const auth = req['auth'] ?? {}

  const roles = await getRoles(auth.uid)
  const roleIds = roles.map(role => role.id)
  const roleNames: string[] = roles.map(role => role.name)

  const permissions = await getPermissions(roleIds)
  const permNames: string[] = permissions.map(p => p.name)

  // parse params
  const params = entry.parseParams(req.body)

  const injections = {
    $uid: auth.uid,
    $roles: roleNames,
    $perms: permissions.map(perm => perm.name),
    $has: (permission_name: string) => {
      return permNames.includes(permission_name)
    },
    $is: (role_name: string) => {
      return roleNames.includes(role_name)
    }
  }
  // validate query
  const result = await entry.validate(params, injections)
  if (result.errors) {
    return res.send({
      code: 1,
      error: result.errors,
      injections
    })
  }

  // execute query
  try {
    const data = await entry.execute(params)
    return res.send({
      code: 0,
      data
    })
  } catch (error) {
    return res.send({
      code: 2,
      error: error,
      injections
    })
  }
})

export default router


// functions

async function getPermissions(role_ids: number[]) {
  assert(role_ids, 'getPermissions(): role_ids cannot be empty')
  if (role_ids.length === 0) {
    return []
  }

  const _ = db.command
  const r = await db.collection('permission')
    .leftJoin('role_permission', 'permission_id', 'id')
    .where({
      role_id: _.in(role_ids)
    })
    .get()

  assert(r.ok, 'getPermissions failed: ' + role_ids.join(','))

  return r.data
}

async function getRoles(uid: number) {
  const r = await db.collection('user_role')
    .leftJoin('role', 'id', 'role_id')
    .where({ uid })
    .get()

  assert(r.ok, 'getRoles failed')
  return r.data
}
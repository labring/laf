import { Router } from 'express'
import { Entry, MysqlAccessor } from 'less-api'
import Config from '../config'
import { getPermissions, getRoles } from '../lib/api/permission'


const rules = require('../rules/admin.json')

const router = Router()

const accessor = new MysqlAccessor(Config.db)
const entry = new Entry(accessor)
entry.init()
entry.loadRules(rules)

router.post('/entry', async (req, res) => {

  const auth = req['auth'] ?? {}

  if (!auth.uid) {
    return res.status(401).send()
  }

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
      error: error.toString(),
      injections
    })
  }
})

export default router
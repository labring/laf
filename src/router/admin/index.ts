import { Router } from 'express'
import { getToken, hash } from '../../lib/token'
import { db } from '../../lib/db'
import { now } from '../../lib/time'
import { getPermissions, getRoles } from '../../lib/api/permission'

export const AdminRouter = Router()

/**
 * 管理员登陆
 */
AdminRouter.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.send({
      code: 1,
      error: 'invalid username or password'
    })
  }

  //
  const ret = await db.collection('admin')
    .leftJoin('base_user', 'id', 'uid')
    .where({ username, password: hash(password) })
    .get()

  if (ret.ok && ret.data.length) {
    const admin = ret.data[0]

    // 查询管理员的角色列表
    const roles = await getRoles(admin.uid)
    const roleIds = roles.map(role => role.id)

    // 默认 token 有效期为 7 天
    const expire = new Date().getTime() + 60 * 60 * 1000 * 24 * 7
    const payload = {
      uid: admin.uid,
      roles: roleIds,
      type: 'admin'
    }
    const access_token = getToken(payload, expire)
    return res.send({
      code: 0,
      data: {
        access_token,
        username,
        uid: admin.uid,
        expire
      }
    })
  }

  return res.send({
    code: 1,
    error: 'invalid username or password'
  })
})


/**
 * 管理员信息
 */
AdminRouter.get('/info', async (req, res) => {
  const uid = req['auth']?.uid

  if (!uid) {
    return res.status(401)
  }

  //
  const ret = await db.collection('admin')
    .where({ uid })
    .get()

  if (!ret.ok || !ret.data.length) {
    return res.send({
      code: 1,
      error: 'query admin error'
    })
  }

  const admin = ret.data[0]

  // 查询管理员的角色列表
  const roles = await getRoles(admin.uid)

  return res.send({
    code: 0,
    data: {
      admin,
      roles: roles.map(role => role.name)
    }
  })
})

/**
 * 新增管理员
 */
AdminRouter.post('/add', async (req, res) => {
  const uid = req['auth']?.uid
  if (!uid) {
    return res.status(401).send()
  }

  // 查询管理员的角色列表
  const roles = await getRoles(uid)

  const rids = roles.map(r => r.id)

  const permissions = await getPermissions(rids)
  const pnames = permissions.map(p => p.name)

  if (!pnames.includes('admin.create')) {
    return res.status(403).send()
  }

  const { username, password, avatar, name } = req.body
  if (!username || !password) {
    return res.send({
      code: 1,
      error: 'username or password cannot be empty'
    })
  }

  const { total } = await db.collection('admin').where({ username }).count()
  if (total > 0) {
    return res.send({
      code: 1,
      error: 'username already exists'
    })
  }

  // add base user
  const { id } = await db.collection('base_user')
    .add({ password: hash(password) })

  // add admim
  const r = await db.collection('admin')
    .add({
      uid: id,
      username,
      name: name ?? null,
      avatar: avatar ?? null,
      created_at: now(),
      updated_at: now()
    })
  return res.send({
    code: 0,
    data: {
      ...r,
      uid: id
    }
  })
})
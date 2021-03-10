import { Router } from 'express'
import { getToken, hash } from '../../lib/token'
import { db } from '../../lib/db'
import assert = require('assert')

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
    const r_role = await db.collection('user_role').where({ user_id: admin.uid }).get()
    assert.ok(r_role.ok, 'query user_role failed: ' + admin.uid)

    const roles = r_role.data.map(role => role.id)

    // 默认 token 有效期为 7 天
    const expire = new Date().getTime() + 60 * 60 * 1000 * 24 * 7
    const payload = {
      uid: admin.uid,
      roles,
      type: 'admin'
    }
    const access_token = getToken(payload, expire)
    return res.send({
      code: 0,
      access_token,
      username,
      uid: admin.uid,
      expire
    })
  }

  return res.send({
    code: 1,
    error: 'invalid username or password'
  })
})
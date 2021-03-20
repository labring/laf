import { Router } from 'express'
import { getToken, hash } from '../../lib/token'
import { db } from '../../lib/db'
import assert = require('assert')
import { now } from '../../lib/time'
export const RegisterRouter = Router()

/**
* 用户名/手机号/邮箱+密码注册
*/
RegisterRouter.post('/register/password', async (req, res) => {
  const { username, email, phone, password } = req.body
  let key, value = null
  if (username) {
    key = 'username'
    value = username
  } else if (email) {
    key = 'email'
    value = email
  } else if (phone) {
    key = 'phone'
    value = phone
  }

  if (!key || !value || !password) {
    return res.send({ code: 1, error: 'invalid username or password' })
  }

  // 检查邮箱/手机/用户名 是否已存在
  const r_count = await db.collection('users')
    .where({ [key]: value })
    .count()

  assert(r_count.ok, `check ${key} exists occurs error`)
  if (r_count.total > 0) {
    return res.send({
      code: 1,
      error: `${key} already exists`
    })
  }

  // 创建 base user
  const { id: uid } = await db.collection('base_user').add({
    password: hash(password),
    created_at: now(),
    updated_at: now()
  })

  // 创建 user
  await db.collection('users').add({
    uid,
    [key]: value,
    created_at: now(),
    updated_at: now()
  })

  // 注册完成后自动登录，生成 token: 默认 token 有效期为 7 天
  const expire = new Date().getTime() + 60 * 60 * 1000 * 24 * 7
  const payload = {
    uid,
    type: 'user'
  }
  const access_token = getToken(payload, expire)
  return res.send({
    code: 0,
    data: {
      access_token,
      email,
      phone,
      username,
      uid,
      expire
    }
  })
})
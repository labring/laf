import { Router } from 'express'
import { getToken, hash } from '../../lib/token'
import { db } from '../../lib/db'

const router = Router()

/**
 * 管理员登陆
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body

  //
  const adminRes = await db.collection('admin')
    .where({ username })
    .get()

  const [admin] = adminRes.data
  if (!admin) {
    return res.send({
      code: 1,
      error: 'invalid username or password'
    })
  }

  const userRes = await db.collection('basic_user')
    .where({ id: admin.uid, password: hash(password) })
    .get()

  const [found] = userRes.data

  if (found) {
    // 默认 token 有效期为 7 天
    const expire = new Date().getTime() + 60 * 60 * 1000 * 24 * 7
    const access_token = getToken({ uid: admin.uid }, expire)
    return res.send({
      code: 0,
      access_token,
      username,
      uid: admin.uid,
      expire,
      type: 'admin'
    })
  }

  return res.send({
    code: 1,
    message: 'invalid username or password'
  })
})
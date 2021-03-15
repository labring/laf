import { Router } from 'express'
import { getToken, hash } from '../../lib/token'
import { db } from '../../lib/db'

export const LoginRouter = Router()

/**
* 用户名/手机号/邮箱+密码登陆
*/
LoginRouter.post('/login/password', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.send({
      code: 1,
      error: 'invalid phone or password'
    })
  }

  //
  const ret = await db.collection('user')
    .leftJoin('base_user', 'id', 'uid')
    .leftJoin('user_profile', 'uid', 'uid')
    .where({
      password: hash(password),
      $or: [
        { email: username },
        { phone: username },
        { username: username }
      ]
    })
    .get()

  if (ret.ok && ret.data.length) {
    const user = ret.data[0]

    // 默认 token 有效期为 7 天
    const expire = new Date().getTime() + 60 * 60 * 1000 * 24 * 7
    const payload = {
      uid: user.uid,
      type: 'user'
    }
    const access_token = getToken(payload, expire)
    return res.send({
      code: 0,
      data: {
        access_token,
        username: user.username,
        phone: user.phone,
        uid: user.uid,
        expire
      }
    })
  }

  return res.send({
    code: 1,
    error: 'invalid phone or password'
  })
})
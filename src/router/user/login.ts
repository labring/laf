import { Router } from 'express'
import { getToken, hash } from '../../lib/api/token'
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
  const ret = await db.collection('users')
    .withOne({
      query: db.collection('password').field({ password: 0 }).where({  password: hash(password), type: 'login' }),
      localField: '_id',
      foreignField: 'uid'
    })
    .where({
      $or: [
        { email: username },
        { phone: username },
        { username: username }
      ]
    })
    .merge({ intersection: true })

  if (ret.ok && ret.data.length) {
    const user = ret.data[0]

    // 默认 token 有效期为 7 天
    const expire = new Date().getTime() + 60 * 60 * 1000 * 24 * 7
    const payload = {
      uid: user._id,
      type: 'user'
    }
    const access_token = getToken(payload, expire)
    return res.send({
      code: 0,
      data: {
        access_token,
        user,
        uid: user._id,
        expire
      }
    })
  }

  return res.send({
    code: 1,
    error: 'invalid phone or password'
  })
})
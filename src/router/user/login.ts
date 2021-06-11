import { Router } from 'express'
import { getToken } from '../../lib/utils/token'
import { db } from '../../lib/db'
import { hashPassword } from '../../lib/utils/hash'

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
      query: db.collection('password')
        .field({ password: 0 })
        .where({ password: hashPassword(password), type: 'login' }),
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
    const expire = Math.floor(Date.now() / 1000) + 60 * 60  * 24 * 7
    const payload = {
      uid: user._id,
      type: 'user',
      exp: expire
    }
    const access_token = getToken(payload)
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
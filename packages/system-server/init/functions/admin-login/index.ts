import cloud from '@/cloud-sdk'
import * as crypto from 'crypto'

exports.main = async function (ctx) {
  const db = cloud.database()
  const { username, password } = ctx.body

  if (!username || !password) {
    return '用户密码不正确'
  }

  const ret = await db.collection('admins')
    .withOne({
      query: db
        .collection('password')
        .where({ password: hashPassword(password), type: 'login' }),
      localField: '_id',
      foreignField: 'uid'
    })
    .where({ username })
    .merge({ intersection: true })

  if (ret.ok && ret.data.length) {
    const admin = ret.data[0]

    // 默认 token 有效期为 7 天
    const expire = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
    const payload = {
      uid: admin._id,
      type: 'admin',
      exp: expire
    }
    const access_token = cloud.getToken(payload)

    return {
      access_token,
      username,
      uid: admin._id,
      expire
    }
  }

  return 'invalid username or password'
}


/**
 * @param {string} content
 * @return {string}
 */
function hashPassword(content: string): string {
  return crypto
    .createHash('sha256')
    .update(content)
    .digest('hex')
}


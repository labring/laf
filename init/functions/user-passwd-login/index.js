import * as crypto from 'crypto'

/**
 * @body username string 用户名
 * @body password string 密码
 */
export async function main(ctx) {
  const db = less.database()

  // 参数验证
  const { username, password } = ctx.body
  if (!username || !password) {
    return { code: 1, error: 'invalid phone or password' }
  }

  // 验证用户名是否存在
  const { data: user } = await db.collection('users')
    .where({ username })
    .getOne()

  if (!user) {
    return {code: 1, error: 'invalid username or password'}
  }

  // 验证密码是否正确
  const ret = await db.collection('password')
    .where({ uid: user._id, password: hashPassword(password), type: 'login' })
    .count()

  if (ret.total > 0) {

    // 默认 token 有效期为 7 天
    const expire = Math.floor(Date.now() / 1000) + 60 * 60  * 24 * 7
    const payload = {
      uid: user._id,
      type: 'user',
      exp: expire
    }
    const access_token = less.getToken(payload)
    return {
      code: 0,
      data: {
        access_token,
        user,
        uid: user._id,
        expire
      }
    }
  }

  return { code: 1, error: 'invalid username or password' }
}

/**
 * @param {string} content
 * @return {string}
 */
function hashPassword(content) {
  return crypto
    .createHash('sha256')
    .update(content)
    .digest('hex')
}


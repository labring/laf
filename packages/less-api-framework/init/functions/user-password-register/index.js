import * as crypto from 'crypto'

/**
 * @body username string 用户名
 * @body password string 密码
 */
 exports.main = async function (ctx) {
  const db = less.database()

  // 参数验证
  const { username, password } = ctx.body
  if (!username|| !password) {
    return { code: 1, error: 'invalid username or password' }
  }

  // 检查用户名是否已存在
  const r_count = await db.collection('users')
    .where({ username })
    .count()

  if (r_count.total > 0) {
    return { code: 1, error: `${username} already exists` }
  }

  // 创建 user
  const r = await db.collection('users').add({
    username,
    created_at: Date.now(),
    updated_at: Date.now()
  })

  // 创建 user password
  await db.collection('password').add({
    uid: r.id,
    password: hashPassword(password),
    type: "login",
    created_at: Date.now(),
    updated_at: Date.now()
  })


  // 注册完成后自动登录，生成 token: 默认 token 有效期为 7 天
  const expire = Math.floor(Date.now()) + 60 * 60 * 24 * 7
  const payload = {
    uid: r.id,
    type: 'user',
    exp: expire
  }

  const access_token = less.getToken(payload)
  return {
    code: 0,
    data: {
      access_token,
      username,
      uid: r.id,
      expire
    }
  }
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




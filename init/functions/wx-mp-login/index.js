
// 主函数
exports.main = async function (ctx) {
  const db = less.database()


  const { body } = ctx
  const code = body.code

  // 获取 openid
  const openid = await getOpenId(code)
  if (!openid) {
    return 'invalid code'
  }

  // 根据 openid 获取新用户
  let { data } = await db.collection('users')
    .where({ openid })
    .getOne()


  // 如果用户不存在
  if (!data) {
    // 添加新用户
    await db.collection('users')
      .add({
        openid,
        created_at: Date.now(),
        updated_at: Date.now()
      })

    const r = await db.collection('users')
      .where({ openid })
      .getOne()

    data = r.data
  }

  // 生成 token
  const expire = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
  const token = less.getToken({uid: data._id, exp: expire })
  return {
    uid: data._id,
    access_token: token,
    openid,
    expire
  }
}

/**
 * 获取 openid
 * @param {string} code Then auth code
 * @return {Promise<string>}
 */
async function getOpenId(code) {
  const appid = "wx7aecb50b1440758d"
  const appsecret = "b0095168cded167e2ad6d2b1a2878722"

  const api_url = `https://api.weixin.qq.com/sns/jscode2session`
  const param = `appid=${appid}&secret=${appsecret}&js_code=${code}&grant_type=authorization_code`
  
  console.log('request url: ', `${api_url}?${param}`)
  
  const res = await less.fetch(`${api_url}?${param}`)

  console.log(res.data)
  // { session_key: string; openid: string } 
  
  if (res.errcode > 0) {
    return null
  }

  return res?.data?.openid
}


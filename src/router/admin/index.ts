import { Router } from 'express'
import { getToken, hash } from '../../lib/token'
import { db } from '../../lib/db'
import { now } from '../../lib/time'
import { getPermissions } from '../../lib/api/permission'

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
  const ret = await db.collection('admins')
    .withOne({
      query: db.collection('base_user').where({ password: hash(password) }),
      localField: 'uid',
      foreignField: '_id'
    })
    .where({ username })
    .merge({ intersection: true })

  if (ret.ok && ret.data.length) {
    const admin = ret.data[0]

    // 默认 token 有效期为 7 天
    const expire = new Date().getTime() + 60 * 60 * 1000 * 24 * 7
    const payload = {
      uid: admin.uid,
      type: 'admin'
    }
    const access_token = getToken(payload, expire)
    return res.send({
      code: 0,
      data: {
        access_token,
        username,
        uid: admin.uid,
        expire
      }
    })
  }

  return res.send({
    code: 1,
    error: 'invalid username or password'
  })
})


/**
 * 管理员信息
 */
AdminRouter.get('/info', async (req, res) => {
  const uid = req['auth']?.uid

  if (!uid) {
    return res.status(401)
  }

  //
  const ret = await db.collection('admins')
    .where({ uid })
    .get()

  if (!ret.ok || !ret.data.length) {
    return res.send({
      code: 1,
      error: 'query admin error'
    })
  }

  const admin = ret.data[0]


  return res.send({
    code: 0,
    data: admin
  })
})

/**
 * 新增管理员
 */
AdminRouter.post('/add', async (req, res) => {
  const uid = req['auth']?.uid
  if (!uid) {
    return res.status(401).send()
  }

  console.log(await getPermissions(uid))

  const { permissions } = await getPermissions(uid)

  if (!permissions.includes('admin.create')) {
    return res.status(403).send()
  }

  const { username, password, avatar, name } = req.body
  if (!username || !password) {
    return res.send({
      code: 1,
      error: 'username or password cannot be empty'
    })
  }

  const { total } = await db.collection('admins').where({ username }).count()
  if (total > 0) {
    return res.send({
      code: 1,
      error: 'username already exists'
    })
  }

  // add base user
  const { id } = await db.collection('base_user')
    .add({ password: hash(password) })

  // add admim
  const r = await db.collection('admins')
    .add({
      uid: id,
      username,
      name: name ?? null,
      avatar: avatar ?? null,
      created_at: now(),
      updated_at: now()
    })
  return res.send({
    code: 0,
    data: {
      ...r,
      uid: id
    }
  })
})


/**
 * 编辑管理员
 */
AdminRouter.post('/edit', async (req, res) => {
  // 权限验证
  {
    // 当前登陆管理员的 uid
    const cur_uid = req['auth']?.uid
    if (!cur_uid) {
      return res.status(401).send()
    }

    const { permissions } = await getPermissions(cur_uid)

    if (!permissions.includes('admin.edit')) {
      return res.status(403).send()
    }
  }

  // 参数验证
  const { uid, username, password, avatar, name } = req.body
  if (!uid) {
    return res.send({
      code: 1,
      error: 'uid cannot be empty'
    })
  }

  const { data: admins } = await db.collection('admins').where({ uid }).get()
  if (!admins || !admins.length) {
    return res.send({
      code: 1,
      error: 'user not exists'
    })
  }


  // update password
  if (password) {
    await db.collection('base_user')
      .where({ id: uid })
      .update({
        password: hash(password),
        updated_at: now()
      })
  }

  const old = admins[0]

  // update admim
  const data = {
    updated_at: now()
  }

  // username
  if (username && username != old.username) {
    const { total } = await db.collection('admins').where({ username }).count()
    if (total) {
      return res.send({
        code: 1,
        error: 'username already exists'
      })
    }
    data['username'] = username
  }

  // avatar
  if (avatar && avatar != old.avatar) {
    data['avatar'] = avatar
  }

  // name
  if (name && name != old.name) {
    data['name'] = name
  }

  const r = await db.collection('admins')
    .where({ uid })
    .update(data)

  return res.send({
    code: 0,
    data: {
      ...r,
      uid
    }
  })
})
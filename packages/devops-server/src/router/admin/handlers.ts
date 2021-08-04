import { Request, Response } from 'express'
import { getToken } from '../../lib/utils/token'
import { checkPermission, getPermissions } from '../../api/permission'
import { hashPassword } from '../../lib/utils/hash'
import { Globals } from '../../lib/globals'
import Config from '../../config'

const db = Globals.sys_db
const logger = Globals.logger

/**
 * 管理员登陆
 */
export async function handleAdminLogin(req: Request, res: Response) {
  const requestId = req['requestId']
  const { username, password } = req.body
  logger.info(`[${requestId}] /admin/login username: ${username}`)

  if (!username || !password) {
    return res.send({
      code: 1,
      error: 'invalid username or password'
    })
  }

  const ret = await db.collection('__admins')
    .withOne({
      query: db
        .collection('__password')
        .where({ password: hashPassword(password), type: 'login' }),
      localField: '_id',
      foreignField: 'uid'
    })
    .where({ username })
    .merge({ intersection: true })


  if (ret.ok && ret.data.length) {
    const admin = ret.data[0]

    const expire = Math.floor(Date.now() / 1000) + 60 * 60 * Config.TOKEN_EXPIRED_TIME
    const payload = {
      uid: admin._id,
      type: 'admin',
      exp: expire
    }
    const access_token = getToken(payload)
    logger.info(`[${requestId}] admin login success: ${admin._id} ${username}`)

    let debug_token = undefined

    // if user has debug function permission
    const canDebug = await checkPermission(admin._id, 'function.debug')
    if (canDebug === 0) {
      debug_token = getToken({ uid: admin._id, type: 'debug', exp: expire }, Config.APP_SERVER_SECRET_SALT)
    }

    return res.send({
      code: 0,
      data: {
        access_token,
        debug_token,
        username,
        uid: admin._id,
        expire
      }
    })
  }

  return res.send({
    code: 1,
    error: 'invalid username or password'
  })
}


/**
 * 管理员信息
 */
export async function handleAdminInfo(req: Request, res: Response) {
  const requestId = req['requestId']
  const uid = req['auth']?.uid
  logger.info(`[${requestId}] /admin/info: ${uid}`)

  if (!uid) {
    return res.status(401)
  }

  //
  const ret = await db.collection('__admins')
    .where({ _id: uid })
    .get()

  if (!ret.ok || !ret.data.length) {
    return res.send({
      code: 1,
      error: 'query admin error'
    })
  }

  const admin = ret.data[0]

  const { permissions } = await getPermissions(admin._id)

  return res.send({
    code: 0,
    data: {
      ...admin,
      permissions
    }
  })
}

/**
 * 新增管理员
 */
export async function handleAdminAdd(req: Request, res: Response) {
  const requestId = req['requestId']
  logger.info(`[${requestId}] /admin/add: ${req.body?.username}`)

  // 权限验证
  const code = await checkPermission(req['auth']?.uid, 'admin.create')
  if (code) {
    return res.status(code).send()
  }

  const { username, password, avatar, name, roles } = req.body
  if (!username || !password) {
    return res.send({
      code: 1,
      error: 'username or password cannot be empty'
    })
  }

  // 验证用户是否已存在
  const { total } = await db.collection('__admins').where({ username }).count()
  if (total > 0) {
    return res.send({
      code: 1,
      error: 'username already exists'
    })
  }

  // 验证 roles 是否合法
  const { total: valid_count } = await db.collection('__roles')
    .where({
      name: db.command.in(roles)
    }).count()

  if (valid_count !== roles.length) {
    return res.send({
      code: 1,
      error: 'invalid roles'
    })
  }

  // add admin
  const r = await db.collection('__admins')
    .add({
      username,
      name: name ?? null,
      avatar: avatar ?? null,
      roles: roles ?? [],
      created_at: Date.now(),
      updated_at: Date.now()
    })

  // add admin password
  await db.collection('__password')
    .add({
      uid: r.id,
      password: hashPassword(password),
      type: 'login',
      created_at: Date.now(),
      updated_at: Date.now()
    })

  return res.send({
    code: 0,
    data: {
      ...r,
      uid: r.id
    }
  })
}


/**
 * 编辑管理员
 */
export async function handleAdminEdit(req: Request, res: Response) {
  const requestId = req['requestId']
  logger.info(`[${requestId}] /admin/edit: ${req.body?.uid}`)

  // 权限验证
  const code = await checkPermission(req['auth']?.uid, 'admin.edit')
  if (code) {
    return res.status(code).send()
  }

  // 参数验证
  const { _id: uid, username, password, avatar, name, roles } = req.body
  if (!uid) {
    return res.send({
      code: 1,
      error: 'admin id cannot be empty'
    })
  }

  // 验证 uid 是否合法
  const { data: admins } = await db.collection('__admins').where({ _id: uid }).get()
  if (!admins || !admins.length) {
    return res.send({
      code: 1,
      error: 'user not exists'
    })
  }

  // 验证 roles 是否合法
  const { total: valid_count } = await db.collection('__roles')
    .where({
      name: db.command.in(roles)
    }).count()

  if (valid_count !== roles.length) {
    return res.send({
      code: 1,
      error: 'invalid roles'
    })
  }

  // update password
  if (password) {
    await db.collection('__password')
      .where({ uid: uid })
      .update({
        password: hashPassword(password),
        updated_at: Date.now()
      })
  }

  const old = admins[0]

  // update admim
  const data = {
    updated_at: Date.now()
  }

  // username
  if (username && username != old.username) {
    const { total } = await db.collection('__admins').where({ username }).count()
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

  // roles
  if (roles) {
    data['roles'] = roles
  }

  const r = await db.collection('__admins')
    .where({ _id: uid })
    .update(data)

  return res.send({
    code: 0,
    data: {
      ...r,
      uid
    }
  })
}
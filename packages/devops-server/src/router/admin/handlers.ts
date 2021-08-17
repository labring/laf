/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-18 00:10:46
 * @Description: 
 */

import { Request, Response } from 'express'
import { getToken } from '../../lib/utils/token'
import { checkPermission, getPermissions } from '../../api/permission'
import { hashPassword } from '../../lib/utils/hash'
import { DatabaseAgent } from '../../lib/db-agent'
import Config from '../../config'
import { Constants } from '../../constants'
import { logger } from '../../lib/logger'

const db = DatabaseAgent.sys_db

/**
 * The handler of admin login
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

  const ret = await db.collection(Constants.cn.admins)
    .withOne({
      query: db
        .collection(Constants.cn.password)
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

    // generate debug token if user has debug function permission
    const canDebug = await checkPermission(admin._id, 'function.debug')
    if (canDebug === 0) {
      debug_token = getToken({ uid: admin._id, type: 'debug', exp: expire }, Config.APP_SERVER_SECRET_SALT)
    }

    // generate file operation token if user has file manage permission 
    let file_token = undefined
    const canReadFile = await checkPermission(admin._id, 'file.read')
    const canCreateFile = await checkPermission(admin._id, 'file.create')
    const ops = ['read']
    if (canCreateFile === 0) {
      ops.push('create')
    }
    if (canReadFile === 0) {
      file_token = getToken({ uid: admin._id, bucket: '*', ops, exp: expire }, Config.APP_SERVER_SECRET_SALT)
    }

    return res.send({
      code: 0,
      data: {
        access_token,
        debug_token,
        file_token,
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
 * The handler of getting admin info
 */
export async function handleAdminInfo(req: Request, res: Response) {
  const requestId = req['requestId']
  const uid = req['auth']?.uid
  logger.info(`[${requestId}] /admin/info: ${uid}`)

  if (!uid) {
    return res.status(401)
  }

  //
  const ret = await db.collection(Constants.cn.admins)
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
 * The handler of adding admin
 */
export async function handleAdminAdd(req: Request, res: Response) {
  const requestId = req['requestId']
  logger.info(`[${requestId}] /admin/add: ${req.body?.username}`)

  // check permission 
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

  // check if user exists
  const { total } = await db.collection(Constants.cn.admins).where({ username }).count()
  if (total > 0) {
    return res.send({
      code: 1,
      error: 'username already exists'
    })
  }

  // check if roles are valid
  const { total: valid_count } = await db.collection(Constants.cn.roles)
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
  const r = await db.collection(Constants.cn.admins)
    .add({
      username,
      name: name ?? null,
      avatar: avatar ?? null,
      roles: roles ?? [],
      created_at: Date.now(),
      updated_at: Date.now()
    })

  // add admin password
  await db.collection(Constants.cn.password)
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
 * The handler of editing admin
 */
export async function handleAdminEdit(req: Request, res: Response) {
  const requestId = req['requestId']
  logger.info(`[${requestId}] /admin/edit: ${req.body?.uid}`)

  // check permission
  const code = await checkPermission(req['auth']?.uid, 'admin.edit')
  if (code) {
    return res.status(code).send()
  }

  // check if params valid
  const { _id: uid, username, password, avatar, name, roles } = req.body
  if (!uid) {
    return res.send({
      code: 1,
      error: 'admin id cannot be empty'
    })
  }

  // check if uid valid
  const { data: admins } = await db.collection(Constants.cn.admins).where({ _id: uid }).get()
  if (!admins || !admins.length) {
    return res.send({
      code: 1,
      error: 'user not exists'
    })
  }

  // check if roles are valid
  const { total: valid_count } = await db.collection(Constants.cn.roles)
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
    await db.collection(Constants.cn.password)
      .where({ uid: uid })
      .update({
        password: hashPassword(password),
        updated_at: Date.now()
      })
  }

  const old = admins[0]

  // update admin
  const data = {
    updated_at: Date.now()
  }

  // update username if provided
  if (username && username != old.username) {
    const { total } = await db.collection(Constants.cn.admins).where({ username }).count()
    if (total) {
      return res.send({
        code: 1,
        error: 'username already exists'
      })
    }
    data['username'] = username
  }

  // update avatar if provided
  if (avatar && avatar != old.avatar) {
    data['avatar'] = avatar
  }

  // update name if provided
  if (name && name != old.name) {
    data['name'] = name
  }

  // update roles if provided
  if (roles) {
    data['roles'] = roles
  }

  const r = await db.collection(Constants.cn.admins)
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
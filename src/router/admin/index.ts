import { Router } from 'express'
import { getToken, hash } from '../../lib/token'
import { db } from '../../lib/db'
import { checkPermission, getPermissions } from '../../lib/api/permission'
import { getLogger } from '../../lib/logger'
import { entry as adminEntry } from '../../entry/admin'
import { entry as appEntry } from '../../entry/app'
import { getAccessRules } from '../../lib/rules'
import { Ruler } from 'less-api'

export const AdminRouter = Router()
const logger = getLogger('admin:api')
/**
 * 管理员登陆
 */
AdminRouter.post('/login', async (req, res) => {
  const requestId = req['requestId']
  const { username, password } = req.body
  logger.info(`[${requestId}] /admin/login username: ${username}`)


  if (!username || !password) {
    return res.send({
      code: 1,
      error: 'invalid username or password'
    })
  }

  //
  const ret = await db.collection('admins')
    .withOne({
      query: db.collection('password').where({ password: hash(password), type: 'login' }),
      localField: '_id',
      foreignField: 'uid'
    })
    .where({ username })
    .merge({ intersection: true })

  if (ret.ok && ret.data.length) {
    const admin = ret.data[0]

    // 默认 token 有效期为 7 天
    const expire = new Date().getTime() + 60 * 60 * 1000 * 24 * 7
    const payload = {
      uid: admin._id,
      type: 'admin'
    }
    const access_token = getToken(payload, expire)
    logger.info(`[${requestId}] admin login success: ${admin._id} ${username}`)

    return res.send({
      code: 0,
      data: {
        access_token,
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
})


/**
 * 管理员信息
 */
AdminRouter.get('/info', async (req, res) => {
  const requestId = req['requestId']
  const uid = req['auth']?.uid
  logger.info(`[${requestId}] /admin/info: ${uid}`)

  if (!uid) {
    return res.status(401)
  }

  //
  const ret = await db.collection('admins')
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
})

/**
 * 新增管理员
 */
AdminRouter.post('/add', async (req, res) => {
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
  const { total } = await db.collection('admins').where({ username }).count()
  if (total > 0) {
    return res.send({
      code: 1,
      error: 'username already exists'
    })
  }

  // 验证 roles 是否合法
  const { total: valid_count } = await db.collection('roles')
    .where({
      name: db.command.in(roles)
    }).count()

  if (valid_count !== roles.length) {
    return res.send({
      code: 1,
      error: 'invalid roles'
    })
  }

  // add admim
  const r = await db.collection('admins')
    .add({
      username,
      name: name ?? null,
      avatar: avatar ?? null,
      roles: roles ?? [],
      created_at: Date.now(),
      updated_at: Date.now()
    })

  // add admin password
  await db.collection('password')
    .add({
      uid: r.id,
      password: hash(password),
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
})


/**
 * 编辑管理员
 */
AdminRouter.post('/edit', async (req, res) => {
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
  const { data: admins } = await db.collection('admins').where({ _id: uid }).get()
  if (!admins || !admins.length) {
    return res.send({
      code: 1,
      error: 'user not exists'
    })
  }

  // 验证 roles 是否合法
  const { total: valid_count } = await db.collection('roles')
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
    await db.collection('password')
      .where({ uid: uid })
      .update({
        password: hash(password),
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

  // roles
  if (roles) {
    data['roles'] = roles
  }

  const r = await db.collection('admins')
    .where({ _id: uid })
    .update(data)

  return res.send({
    code: 0,
    data: {
      ...r,
      uid
    }
  })
})


/**
 * 应用最新访问规则
 */
AdminRouter.post('/apply/rules', async (req, res) => {
  const requestId = req['requestId']
  logger.info(`[${requestId}] /admin/edit: ${req.body?.uid}`)

  // 权限验证
  const code = await checkPermission(req['auth']?.uid, 'rule.apply')
  if (code) {
    return res.status(code).send()
  }

  // apply admin rules
  try {
    const ruler = new Ruler(adminEntry.accessor)
    logger.debug(`[${requestId}] apply admin rule`)
    const rules = await getAccessRules('admin', adminEntry.accessor)
    ruler.load(rules)
    adminEntry.setRuler(ruler)
  } catch (error) {
    logger.error(`[${requestId}] apply admin rule error: `, error)
  }


  // apply app rules
  try {
    const ruler = new Ruler(adminEntry.accessor)
    logger.debug(`[${requestId}] apply admin rule`)
    const rules = await getAccessRules('app', appEntry.accessor)
    ruler.load(rules)
    appEntry.setRuler(ruler)
  } catch (error) {
    logger.error(`[${requestId}] apply app rule error: `, error)
  }

  return res.send({
    code: 0,
    data: 'applied'
  })

})
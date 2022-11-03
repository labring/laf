const funcString = `
import cloud from '@/cloud-sdk'
import * as crypto from 'crypto'
const db = cloud.database()

exports.main = async function (ctx: FunctionContext) {
  const uid = ctx.auth?.uid
  if (!uid) {
    return 'Unauthorisszssed'
  }

  // 权限验证
  const code = await checkPermission(uid, 'admin.create')
  if (code) {
    return 'Permission denied'
  }

  const { username, password, avatar, name, roles } = ctx.body
  if (!username || !password) {
    return 'username or password cannot be empty'
  }

  // 验证用户是否已存在
  const { total } = await db.collection('admins').where({ username }).count()
  if (total > 0) {
    return 'username already exists'
  }

  // 验证 roles 是否合法
  const { total: valid_count } = await db.collection('roles')
    .where({
      name: db.command.in(roles)
    }).count()

  if (valid_count !== roles.length) {
    return 'invalid roles'
  }

  // add admin
  const r = await db.collection('admins')
    .add({
      username,
      name: name ?? null,
      avatar: avatar ?? null,
      roles: roles ?? [],
      password: hashPassword(password),
      created_at: Date.now(),
      updated_at: Date.now()
    })

  return {
    ...r,
    uid: r.id
  }
}


/**
 * 通过 user id 获取权限列表
 * @param role_ids
 * @returns
 */
async function getPermissions(uid: string) {
  const db = cloud.database()
  // 查用户
  const { data: admin } = await db.collection('admins')
    .where({ _id: uid })
    .getOne()


  // 查角色
  const { data: roles } = await db.collection('roles')
    .where({
      name: {
        $in: admin.roles ?? []
      }
    })
    .get()

  if (!roles) {
    return { permissions: [], roles: [], user: admin }
  }

  const permissions = []
  for (const role of roles) {
    const perms = role.permissions ?? []
    permissions.push(...perms)
  }

  return {
    permissions,
    roles: roles.map(role => role.name),
    user: admin
  }
}



/**
 * 判断用户是否有权限
 * @param uid 用户ID
 * @param permission 权限名
 * @returns 0 表示用户有权限， 401 表示用户未登录， 403 表示用户未授权
 */
async function checkPermission(uid: string, permission: string): Promise<number> {
  if (!uid) {
    return 401
  }
  const { permissions } = await getPermissions(uid)

  if (!permissions.includes(permission)) {
    return 403
  }
  return 0
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
`;

export default funcString;

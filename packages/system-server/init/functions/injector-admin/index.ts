import cloud from '@/cloud-sdk'
import * as crypto from 'crypto'

/**
 * 本函数为 policy injector， 当用户请求 proxy/:policy 时，会调用本函数返回的函数获取该策略的 injections。
 * 返回的 injections 会注入到该策略规则中执行。
 * 例如，本例中返回了 $has 和 $is 函数，则在规则中可以这样使用：
 * ```json
 * {
 *   "add": "$has('article.create')",
 *   "remove": "$is('admin')"
 * }
 * ```
 */

exports.main = async function (ctx) {

  return async function (payload: any, params: any) {
    const auth = payload || {}
    const { permissions, roles } = await getPermissions(auth.uid)
    return {
      ...auth,
      $has: (permissionName) => {
        return permissions.includes(permissionName)
      },
      $is: (roleName) => {
        return roles.includes(roleName)
      }
    }
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


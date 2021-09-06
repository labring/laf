import cloud from '@/cloud-sdk'

exports.main = async function (ctx) {
  const db = cloud.database()
  const uid = ctx.auth?.uid
  if (!uid) {
    return 'Unauthorized'
  }

  //
  const ret = await db.collection('admins')
    .where({ _id: uid })
    .get()

  if (!ret.ok || !ret.data.length) {
    return 'query admin error'
  }

  const admin = ret.data[0]

  const { permissions } = await getPermissions(admin._id)

  return {
    ...admin,
    permissions
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
import cloud from '@/cloud-sdk'

/**
 * 本函数可发放文件访问令牌，用于下载或上传文件
 * @TODO 你可以修改本函数，以实现符合业务的文件访问授权逻辑
 * 
 * @body {string} namespace 文件存储的名字空间
 * @body {string} filename 文件名
 * @body {string} type 授权的操作，取值为： "read" | "create" | "all"
 * @body {number} expire 令牌有效期，单位为秒，默认为一小时，即 3600
 */

 exports.main = async function (ctx) {
  const uid = ctx.auth?.uid
  if (!uid) return 'error: unauthorized'

  const ns = ctx.body?.namespace ?? undefined
  const fn = ctx.body?.filename ?? undefined
  const op = ctx.body?.type ?? 'read'
  const expire = ctx.body?.expire ?? 3600

  if (!ns) {
    return 'error: invalid namespace'
  }

  const exp = Math.floor(Date.now()/1000) + expire
  const payload = { ns, op, exp, fn }

  return cloud.getToken(payload)
}

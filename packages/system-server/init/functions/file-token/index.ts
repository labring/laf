import cloud from '@/cloud-sdk'

/**
 * 本函数可发放文件访问令牌，用于下载或上传文件
 * @TODO 你可以修改本函数，以实现符合业务的文件访问授权逻辑
 * 
 * @body {string} bucket 文件存储的名字空间，bucket = '*' 时代表可访问所有 bucket
 * @body {string} filename 文件名，可选的，如不提供则代表可访问所有文件
 * @body {string[]} ops 授权的操作权限，取值为之一或多个： "read" | "create" | "delete" | "list"
 * @body {number} expire 令牌有效期，单位为秒，默认为一小时，即 3600
 */

exports.main = async function (ctx) {
  const uid = ctx.auth?.uid
  if (!uid) return 'error: unauthorized'

  const bucket = ctx.body?.bucket
  const filename = ctx.body?.filename ?? undefined
  const ops = ctx.body?.ops ?? ['read']
  const expire = ctx.body?.expire ?? 3600

  if (!bucket) {
    return 'error: invalid bucket'
  }

  const exp = Math.floor(Date.now() / 1000) + expire
  const payload = { bucket, filename, exp, ops }

  return cloud.getToken(payload)
}

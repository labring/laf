
import * as path from 'path'

exports.main = async function (ctx) {
  
  // 非登录用户不予上传
  const uid = ctx.auth?.uid
  if (!uid) {
    return { error: 'unauthorized'}
  }

  // 文件不可为空
  const files = ctx?.files
  if (!files?.length) {
    return {  error: 'file cannot be empty' }
  }

  const file = files[0]

  // namespace 只可为数字或字母组合，长度不得长于 32 位
  const namespace = 'public'

  // 存储上传文件
  const storage = less.storage(namespace)

  const filepath = path.join(file.destination, `${file.filename}`)
  const info = await storage.saveFile(filepath)

  // 不得暴露全路径给客户端
  delete info.fullpath

  return info
}

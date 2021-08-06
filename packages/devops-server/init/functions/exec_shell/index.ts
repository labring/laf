
import * as child_process from 'child_process'

/**
 * 可修改本函数，安装指定的依赖包。
 * 注意：
 * 0. 因客户端请求超时时间限制，函数可能在返回前请求超时，但该命令会继续运行，请知晓
 * 1. 不要开启本函数的 HTTP 访问（安全风险）
 * 2. 通常请保持本函数是停用状态（安全风险）
 * 3. 其中 `npm run create-internal-pkg` 是为了创建云函数 sdk 内部包，请在更新过依赖后执行此命令，否则在线 IDE 的类型提示将失效
 */

exports.main = async function (ctx) {
  const r = child_process.execSync("npm i @types/nodemailer nodemailer && npm run create-internal-pkg")
  console.log(r.toString())
  return 'ok'
}

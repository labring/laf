/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-17 21:12:41
 * @LastEditTime: 2021-08-17 21:14:07
 * @Description:
 */

export function assert(expr, message, ...params) {
  if (!expr) {
    console.error(message, params)
    throw new Error(message)
  }
}

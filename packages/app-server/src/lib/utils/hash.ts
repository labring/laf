/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-18 16:44:05
 * @Description: 
 */

import * as crypto from 'crypto'


export function hashPassword(content: string) {
  return crypto
    .createHash('sha256')
    .update(content)
    .digest('hex')
}
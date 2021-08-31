/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-31 15:06:33
 * @Description: 
 */

import * as crypto from 'crypto'

/**
 * hash password
 * @param content 
 * @returns 
 */
export function hashPassword(content: string) {
  return crypto
    .createHash('sha256')
    .update(content)
    .digest('hex')
}
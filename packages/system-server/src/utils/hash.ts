/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-09-01 13:35:33
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

/**
 * hash the code of cloud function
 * @param code 
 * @returns 
 */
export function hashFunctionCode(code: string) {
  return crypto
    .createHash('md5')
    .update(code)
    .digest('hex')
}
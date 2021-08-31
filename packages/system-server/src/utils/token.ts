/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-17 16:45:33
 * @Description: 
 */

import Config from '../config'
import * as jwt from 'jsonwebtoken'
const DEFAULT_SALT = Config.SYS_SERVER_SECRET_SALT

/**
 * Generate a JWT token
 * @param payload 
 * @returns 
 */
export function getToken(payload: any, secret?: string): string {
    return jwt.sign(payload, secret ?? DEFAULT_SALT)
}

/**
 * Parse a JWT token
 * @param token 
 * @returns 
 */
export function parseToken(token: string, secret?: string): any | null {
    if (!token) return null
    try {
        const ret = jwt.verify(token, secret ?? DEFAULT_SALT)
        return ret
    } catch (error) {
        return null
    }
}

/**
 * split bearer token
 * @param bearer "Bearer xxxxx"
 * @returns 
 */
export function splitBearerToken(bearer: string): string | null {
    if (!bearer) return null

    const splitted = bearer?.split(' ')
    const token = splitted?.length === 2 ? splitted[1] : null
    return token
}
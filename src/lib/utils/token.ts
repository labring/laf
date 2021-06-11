import Config from '../../config'
import * as jwt from 'jsonwebtoken'
const secret = Config.SERVER_SALT

/**
 * 生成 token
 * @param payload 
 * @param expire 秒
 * @returns 
 */
export function getToken(payload: any): string {
    return jwt.sign(payload, secret)
}

// 解析 token
export function parseToken(token: string): any | null {
    if (!token) return null
    try {
        const ret = jwt.verify(token, secret)
        return ret
    } catch (error) {
        return null
    }
}

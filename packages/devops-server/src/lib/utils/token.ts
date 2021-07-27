import Config from '../../config'
import * as jwt from 'jsonwebtoken'
const DEFAULT_SALT = Config.SYS_SERVER_SECRET_SALT

/**
 * 生成 token
 * @param payload 
 * @param expire 秒
 * @returns 
 */
export function getToken(payload: any, secret?: string): string {
    return jwt.sign(payload, secret ?? DEFAULT_SALT)
}

/**
 * 解析 token
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
 * 将 bearer 形式的授权数据中把 token 分出来
 * @param bearer "Bearer xxxxx"
 * @returns 
 */
export function splitBearerToken(bearer: string): string | null {
    if(!bearer) return null

    const splitted = bearer?.split(' ')
    const token = splitted?.length === 2 ? splitted[1] : null
    return token
}
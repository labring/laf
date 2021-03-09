import * as crypto from 'crypto'
import Config from '../config'
const secret = Config.SERVER_SALT

// 生成 token
export function getToken(payload: any, expire: number): string {
    const exp = expire || (new Date().getTime() + 60 * 60 * 1000)
    const data = {
        ...payload,
        expire: exp
    }

    const buf = Buffer.from(JSON.stringify(data))
    const base64str = buf.toString('base64')
    const sign_str = hash(base64str)
    return base64str + '.' + sign_str
}

// 解析 token
export function parseToken(token: string): any {
    if (!token) return false

    const pair = token.split('.')
    if (2 !== pair.length || hash(pair[0]) !== pair[1])
        return false

    const buf = Buffer.from(pair[0], 'base64')
    const payload = JSON.parse(buf.toString())
    if (!payload.expire || payload.expire <= new Date().getTime())
        return false
    return payload
}

export function hash(content) {
    return crypto
        .createHash('md5')
        .update(secret + content)
        .digest('hex')
}
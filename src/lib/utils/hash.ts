import * as crypto from 'crypto'
import Config from '../../config'
const secret = Config.SERVER_SALT


export function hashPassword(content) {
  return crypto
    .createHash('md5')
    .update(secret + content)
    .digest('hex')
}
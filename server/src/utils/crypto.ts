import * as crypto from 'crypto'

// use sha256 to hash the password
export function hashPassword(password: string): string {
  const hash = crypto.createHash('sha256')
  hash.update(password)
  return hash.digest('hex')
}

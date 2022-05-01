import * as crypto from 'crypto'

/**
 * Generate application id
 * @returns 
 */
export function generateUUID() {
  return crypto.randomUUID()
}

/**
 * Generate a password
 * @param length the length of password, default is 8
 * @param hasNumbers add numbers to password, [0-9]
 * @param hasSymbols add symbols to password, [!@#$%^&*_-=+]
 * @returns 
 */
export function generatePassword(length = 8, hasNumbers = true, hasSymbols = true) {
  return generateRandString(length, hasNumbers, hasSymbols)
}

/**
 * Generate a rand string
 * @param length the length of password, default is 8
 * @param hasNumbers add numbers to password, [0-9]
 * @param hasSymbols add symbols to password, [!@#$%^&*_-=+]
 * @returns 
 */
export function generateRandString(length = 8, hasNumbers = true, hasSymbols = true) {
  const alpha = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*_-=+'

  let chars = alpha
  if (hasNumbers) chars += numbers
  if (hasSymbols) chars += symbols

  let str = ''
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return str
}



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
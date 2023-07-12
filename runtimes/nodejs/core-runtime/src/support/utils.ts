import * as crypto from 'crypto'

/**
 * Generate UUID v4
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
export function generatePassword(
  length = 8,
  hasNumbers = true,
  hasSymbols = true,
) {
  return generateRandString(length, hasNumbers, hasSymbols)
}

/**
 * Generate a rand string
 * @param length the length of password, default is 8
 * @param hasNumbers add numbers to password, [0-9]
 * @param hasSymbols add symbols to password, [!@#$%^&*_-=+]
 * @returns
 */
export function generateRandString(
  length = 8,
  hasNumbers = true,
  hasSymbols = true,
) {
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

export function hashPassword(content: string) {
  return crypto.createHash('sha256').update(content).digest('hex')
}

/**
 * Recursively deeply freeze objects
 * @param object
 * @returns
 */
export function deepFreeze(object: Object) {
  // Retrieve the property names defined on object
  const propNames = Object.getOwnPropertyNames(object)

  // Freeze properties before freezing self

  for (const name of propNames) {
    const value = object[name]

    if (value && typeof value === 'object') {
      deepFreeze(value)
    }
  }

  return Object.freeze(object)
}

/**
 * nanosecond to ms
 * @param nanoseconds
 * @returns
 */
export function nanosecond2ms(nanoseconds: bigint): number {
  // trim the decimal point by devide 1000
  const _t = nanoseconds / BigInt(1000)

  const ret = parseFloat(_t.toString()) / 1000
  return ret
}

/**
 * sleep
 * @param ms  milliseconds
 * @returns
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * generate md5
 * @param content md5 content
 * @returns
 */
export function md5(content: string) {
  return crypto.createHash('md5').update(content).digest('hex')
}

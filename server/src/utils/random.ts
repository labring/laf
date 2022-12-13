import * as nanoid from 'nanoid'

export function GenerateAlphaNumericPassword(length: number) {
  const nano = nanoid.customAlphabet(
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    length || 16,
  )
  return nano()
}

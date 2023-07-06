import * as nanoid from 'nanoid'
import * as dayjs from 'dayjs'

export function GenerateAlphaNumericPassword(length: number) {
  const nano = nanoid.customAlphabet(
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    length || 16,
  )
  return nano()
}

export function GenerateInviteCode(length?: number) {
  const nano = nanoid.customAlphabet(
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    length || 7,
  )
  return nano()
}

export function GenerateRandomString(length: number) {
  return GenerateAlphaNumericPassword(length)
}

export function GenerateRandomNumericString(length: number) {
  const nano = nanoid.customAlphabet('0123456789', length || 16)
  return nano()
}

export function GenerateOrderNumber() {
  const dateStr = dayjs().format('YYYYMMDDHHMMSS')
  const randomStr = GenerateRandomNumericString(6)
  return `${dateStr}${randomStr}`
}

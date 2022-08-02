import md5 from 'md5'

export function hashString(str: string) {
  return md5(str)
}

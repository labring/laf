
import md5 from 'md5'

export function hashString(str) {
  return md5(str)
}

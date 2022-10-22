import { basename, relative, resolve } from 'path'

export function toCamcelCase(str: string) {
  const s: string[] = []
  for (let i = 0; i < str.length; i++) {
    if (i === 0 || str[i - 1] === '-' || str[i - 1] === '_')
      s.push(str[i].toUpperCase())

    else if (str[i] !== '-' && str[i] !== '_')
      s.push(str[i])
  }
  return s.join('')
}

export function resolveComponentNameByPath(id: string) {
  const dir = resolve(process.cwd(), 'src')
  const path = relative(dir, id)
    .replace(/\.vue$/, '') // remove suffix
    .replace(/\[([.]{3})*(?<name>\S+)\]/g, '$<name>') // remove dynamic params
  const parts = path.split('/')
  return parts.map(toCamcelCase).join('.')
}

export function resolveComponentNameByFileName(id: string) {
  const path = basename(id, '.vue')
  return toCamcelCase(path)
}

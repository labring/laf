/**
 * Get current page base url， like "http://domain:port"
 * @returns URL
 */
export function getCurrentBaseURL() {
  const href = window.location.href
  const { protocol, host } = new URL(href)
  return `${protocol}//${host}`
}

export function byte2mb(bytes: number) {
  return ~~(bytes / 1024 / 1024)
}

export function byte2gb(bytes: number) {
  return ~~(bytes / 1024 / 1024 / 1024)
}

export function formatSpec(spec: any) {
  if (!spec)
    return { label: '-', text: 'unknown' }
  const label = spec.label
  const memory = byte2mb(spec.limit_memory)
  const oss = byte2gb(spec.storage_capacity)
  const db = byte2gb(spec.database_capacity)
  const text = `内存:${memory}MB, 数据库:${db}GB, 存储:${oss}GB`
  return { memory, label, oss, db, text }
}

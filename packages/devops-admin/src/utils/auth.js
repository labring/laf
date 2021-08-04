
const kToken = 'access_token'
const kExpire = 'token_expire'

export function getToken() {
  const token = localStorage.getItem(kToken)
  const expire = parseInt(localStorage.getItem(kExpire) || 0)

  if (!expire || expire <= Date.now() / 1000) {
    removeToken()
    removeDebugToken()
  }

  return token
}

export function setToken(token, expire) {
  localStorage.setItem(kExpire, expire)
  return localStorage.setItem(kToken, token)
}

export function removeToken() {
  localStorage.removeItem(kExpire)
  return localStorage.removeItem(kToken)
}

/**
 * 获取调试云函数的 token
 */
export function getDebugToken() {
  const token = localStorage.getItem('debug_token')
  return token
}

export function setDebugToken(token) {
  return localStorage.setItem('debug_token', token)
}

export function removeDebugToken() {
  return localStorage.removeItem('debug_token')
}

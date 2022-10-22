const kToken = 'access_token'
const kExpire = 'token_expire'

export function getToken(): string {
  const token = localStorage.getItem(kToken) || ''
  const expire = getTokenExpire()

  if (!expire || expire <= Date.now() / 1000)
    removeToken()

  return token
}

export function getTokenExpire(): number {
  const expire = parseInt(localStorage.getItem(kExpire) || '0')
  return expire
}

export function setToken(token: string, expire: number) {
  localStorage.setItem(kExpire, expire.toString())
  return localStorage.setItem(kToken, token)
}

export function removeToken() {
  localStorage.removeItem(kExpire)
  return localStorage.removeItem(kToken)
}

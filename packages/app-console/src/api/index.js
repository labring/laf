
/**
 * Open system client
 */
export function openSystemClient() {
  const href = getSystemClientUrl() || '/'
  window.open(href, '_self')
}

export function setSystemClientUrl(back_url) {
  localStorage.setItem('system_client_url', back_url)
}

export function getSystemClientUrl() {
  return localStorage.getItem('system_client_url')
}

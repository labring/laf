import store from '@/store'
import request from '@/utils/request'

/**
 * Get websites
 * @returns
 */
export async function getWebsites() {
  const appid = store.state.app.appid
  const res = await request({
    url: `/apps/${appid}/websites`,
    method: 'get'
  })

  return res
}

/**
 * Create website
 */
export async function createWebsite(data) {
  const appid = store.state.app.appid
  const res = await request({
    url: `/apps/${appid}/websites`,
    method: 'put',
    data
  })

  return res
}

/**
 * Delete website
 */
export async function deleteWebsite(website_id) {
  const appid = store.state.app.appid
  const res = await request({
    url: `/apps/${appid}/websites/${website_id}`,
    method: 'delete'
  })

  return res
}

/**
 * Check domain is resolvable
 */
export async function domainCheck(domain) {
  const appid = store.state.app.appid
  const res = await request({
    url: `/apps/${appid}/websites/domain/resolve?domain=${domain}`,
    method: 'get'
  })

  return res
}

/**
 * Bind domain to website
 */
export async function bindDomain({ website_id, domain }) {
  const appid = store.state.app.appid
  const res = await request({
    url: `/apps/${appid}/websites/domain/bind`,
    method: 'post',
    data: {
      website_id,
      domain
    }
  })

  return res
}

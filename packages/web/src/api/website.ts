import request from '~/api/request'
import { useAppStore } from '~/store'

const appStore = useAppStore()

/**
 * Get websites
 * @returns
 */
export async function getWebsites(): Promise<any> {
  const appid = appStore.currentApp.appid
  const res = await request({
    url: `/sys-api/apps/${appid}/websites`,
    method: 'get',
  })

  return res
}

/**
 * Create website
 */
export async function createWebsite(data: any): Promise<any> {
  const appid = appStore.currentApp.appid
  const res = await request({
    url: `/sys-api/apps/${appid}/websites`,
    method: 'put',
    data,
  })

  return res
}

/**
 * Delete website
 */
export async function deleteWebsite(website_id: string): Promise<any> {
  const appid = appStore.currentApp.appid
  const res = await request({
    url: `/sys-api/apps/${appid}/websites/${website_id}`,
    method: 'delete',
  })

  return res
}

/**
 * Check domain is resolvable
 */
export async function domainCheck(domain: string): Promise<any> {
  const appid = appStore.currentApp.appid
  const res = await request({
    url: `/sys-api/apps/${appid}/websites/domain/resolve?domain=${domain}`,
    method: 'get',
  })

  return res
}

/**
 * Bind domain to website
 */
export async function bindDomain({ website_id, domain }: any): Promise<any> {
  const appid = appStore.currentApp.appid
  const res = await request({
    url: `/sys-api/apps/${appid}/websites/domain/bind`,
    method: 'post',
    data: {
      website_id,
      domain,
    },
  })

  return res
}

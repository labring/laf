import { Cloud } from 'laf-client-sdk'
import { getToken } from '~/utils/auth'

export const cloud = new Cloud({
  baseUrl: '/sys-extension-api',
  dbProxyUrl: '/proxy/system',
  getAccessToken: getToken,
})

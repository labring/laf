
import { getToken } from '@/utils/auth'
import { Cloud } from 'laf-client-sdk'

export const cloud = new Cloud({
  baseUrl: '/sys-extension-api',
  dbProxyUrl: '/proxy/system',
  getAccessToken: getToken
})

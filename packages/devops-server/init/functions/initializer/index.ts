/**
 * 本函数会默认创建 'App:ready' 事件触发器，应用启动并初始化完成后被自动调用。
 * 
 * 本函数可用于初始化应用必要的一些配置、数据，通常不需要删除此云函数，也不要开启 HTTP 调用。
 */

import cloud from '@/cloud-sdk'
const db = cloud.database()


exports.main = async function (ctx) {

  const r = await cloud.invoke('init-app-rbac', {})
  if (r.data === 'ok') {
    console.log('init rbac: ok')
  }

  return 'ok'
}



import { Cloud } from 'laf-client-sdk'
import request from '~/api/request'
import { useAppStore } from '~/store'
import { getToken } from '~/utils/auth'

const appStore = useAppStore()

/**
 * Get collection list
 */
export function getCollections(): Promise<any> {
  const appid = appStore.currentApp.appid
  return request({
    url: `/sys-api/apps/${appid}/dbm/collections`,
    method: 'get',
  })
}

/**
 * Create collection
 * @param {string} collectionName
 */
export function createCollection(collectionName: string) {
  const appid = appStore.currentApp.appid
  return request({
    url: `/sys-api/apps/${appid}/dbm/collections`,
    method: 'post',
    data: {
      collectionName,
    },
  })
}

/**
 * Update collection
 * @param {string} collectionName
 * @param {object} validatorSchema
 * @param {string} validatorLevel
 */
export function updateCollection(collectionName: any, validatorSchema: any, validatorLevel = 'strict') {
  const appid = appStore.currentApp.appid
  return request({
    url: `/sys-api/apps/${appid}/dbm/collections`,
    method: 'put',
    data: {
      collectionName,
      options: {
        validatorSchema,
        validatorLevel,
      },
    },
  })
}

/**
 * 获取集合的索引信息
 */
export function getCollectionIndexes(collection: any): Promise<any> {
  const appid = appStore.currentApp.appid
  return request({
    url: `/sys-api/apps/${appid}/dbm/collection/indexes?collection=${collection}`,
    method: 'get',
  })
}

/**
 * 创建集合索引
 * @param {String} collection 集合名
 * @return
 */
export function setCollectionIndexes(collection: any, data: any) {
  const appid = appStore.currentApp.appid
  return request({
    url: `/sys-api/apps/${appid}/dbm/collection/indexes?collection=${collection}`,
    method: 'post',
    data,
  })
}

/**
 * 删除集合索引
 * @param {String} collection 集合名
 * @param {String} index 索引名
 * @returns
 */
export function deleCollectionIndex(collection: any, index: any) {
  const appid = appStore.currentApp.appid
  return request({
    url: `/sys-api/apps/${appid}/dbm/collection/indexes?collection=${collection}&index=${index}`,
    method: 'delete',
  })
}

/**
 * Get a Db instance for dbm
 * @returns
 */
export function getDb() {
  const appid = appStore.currentApp.appid
  const dbm_cloud = new Cloud({
    baseUrl: import.meta.env.VITE_APP_BASE_API_SYS,
    dbProxyUrl: `/apps/${appid}/dbm/entry`,
    getAccessToken: getToken,
  })

  return dbm_cloud.database()
}

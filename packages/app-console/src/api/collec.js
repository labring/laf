import request from '@/utils/request'
import store from '@/store'
import { getToken } from '@/utils/auth'
import { Cloud } from 'laf-client-sdk'

/**
 * Get collection list
 */
export function getCollections() {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/dbm/collections`,
    method: 'get'
  })
}

/**
 * Create collection
 * @param {string} collectionName
 */
export function createCollection(collectionName) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/dbm/collections`,
    method: 'post',
    data: {
      collectionName
    }
  })
}

/**
 * Update collection
 * @param {string} collectionName
 * @param {object} validatorSchema
 * @param {string} validatorLevel
 */
export function updateCollection(collectionName, validatorSchema, validatorLevel = 'strict') {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/dbm/collections`,
    method: 'put',
    data: {
      collectionName,
      options: {
        validatorSchema,
        validatorLevel
      }
    }
  })
}

/**
 * 获取集合的索引信息
 */
export function getCollectionIndexes(collection) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/dbm/collection/indexes?collection=${collection}`,
    method: 'get'
  })
}

/**
 * 创建集合索引
 * @param {String} collection 集合名
 * @return
 */
export function setCollectionIndexes(collection, data) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/dbm/collection/indexes?collection=${collection}`,
    method: 'post',
    data
  })
}

/**
 * 删除集合索引
 * @param {String} collection 集合名
 * @param {String} index 索引名
 * @returns
 */
export function deleCollectionIndex(collection, index) {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/dbm/collection/indexes?collection=${collection}&index=${index}`,
    method: 'delete'
  })
}

/**
 * Get a Db instance for dbm
 * @returns
 */
export function getDb() {
  const appid = store.state.app.appid
  const dbm_cloud = new Cloud({
    baseUrl: process.env.VUE_APP_BASE_API_SYS,
    dbProxyUrl: `/apps/${appid}/dbm/entry`,
    getAccessToken: getToken
  })

  return dbm_cloud.database()
}

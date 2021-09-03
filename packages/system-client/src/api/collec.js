import request from '@/utils/request'
import store from '@/store'
import { getToken } from '@/utils/auth'
import { Cloud } from 'less-api-client'

/**
 * Get collection list
 * @param {*} query
 * @param {*} page
 * @param {*} pageSize
 */
export function getCollections() {
  const appid = store.state.app.appid
  return request({
    url: `/apps/${appid}/dbm/collections`,
    method: 'get'
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
    baseUrl: process.env.VUE_APP_BASE_API,
    entryUrl: `/apps/${appid}/dbm/entry`,
    getAccessToken: getToken
  })

  return dbm_cloud.database()
}

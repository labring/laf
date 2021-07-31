import request from '@/utils/request'

/**
 * 获取集合列表
 */
export function getCollections() {
  return request({
    url: `/dbm/collections`,
    method: 'get'
  })
}

/**
 * 获取集合的索引信息
 */
export function getCollectionIndexes(collection = 'functions') {
  return request({
    url: `/dbm/collection/indexes?collection=${collection}`,
    method: 'get'
  })
}

/**
 * 创建集合索引
 * @param {String} collection 集合名
 * @return
 */
export function setCollectionIndexes(collection, data) {
  return request({
    url: `/dbm/collection/indexes?collection=${collection}`,
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
export function deleCollectionIndexe(collection, index) {
  return request({
    url: `/dbm/collection/indexes?collection=${collection}&index=${index}`,
    method: 'delete'
  })
}

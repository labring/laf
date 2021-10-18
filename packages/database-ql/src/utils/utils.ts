import { EJSON } from 'bson'
import { isObject } from './type'

export const sleep = (ms: number = 0) => new Promise(r => setTimeout(r, ms))

const counters: Record<string, number> = {}

export const autoCount = (domain: string = 'any'): number => {
  if (!counters[domain]) {
    counters[domain] = 0
  }
  return counters[domain]++
}


// 递归过滤对象中的undefiend字段
export const filterUndefined = o => {
  // 如果不是对象类型，直接返回
  if (!isObject(o)) {
    return o
  }

  for (let key in o) {
    if (o[key] === undefined) {
      delete o[key]
    } else if (isObject(o[key])) {
      o[key] = filterUndefined(o[key])
    }
  }

  return o
}

export const stringifyByEJSON = params => {
  // params中删除undefined的key
  params = filterUndefined(params)

  return EJSON.stringify(params, { relaxed: false })
}

export const parseByEJSON = params => {
  return EJSON.parse(params)
}
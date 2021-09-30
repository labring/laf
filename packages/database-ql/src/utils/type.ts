import { InternalSymbol } from './symbol'
// import { SYMBOL_REGEXP } from '../helper/symbol'

export const getType = (x: any): string => Object.prototype.toString.call(x).slice(8, -1).toLowerCase()

export const isObject = <T extends object>(x: any): x is T => getType(x) === 'object'

export const isString = (x: any): x is string => getType(x) === 'string'

export const isNumber = (x: any): x is number => getType(x) === 'number'

export const isPromise = <T extends Promise<any> = Promise<any>>(x: any): x is T => getType(x) === 'promise'

type AnyFn = (...args: any[]) => any
export const isFunction = <T extends AnyFn = AnyFn>(x: any): x is T => typeof x === 'function'

export const isArray = <T extends any[]= any[]>(x: any): x is T => Array.isArray(x)

export const isDate = (x: any): x is Date => getType(x) === 'date'

export const isRegExp = (x: any): x is RegExp => getType(x) === 'regexp'

export const isInternalObject = (x: any): boolean => x && (x._internalType instanceof InternalSymbol)

export const isPlainObject = (obj: any): obj is object => {
  if (typeof obj !== 'object' || obj === null) return false

  let proto = obj
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(obj) === proto
}

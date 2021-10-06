/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-10-06 21:36:32
 * @Description: 
 */

import * as ts from 'typescript'

/**
 * Deeply freeze object recursively
 * @param object 
 * @returns 
 */
export function deepFreeze(object: Object) {
  // Retrieve the property names defined on object
  const propNames = Object.getOwnPropertyNames(object)

  // Freeze properties before freezing self
  for (const name of propNames) {
    const value = object[name]

    if (value && typeof value === "object") {
      deepFreeze(value)
    }
  }

  return Object.freeze(object)
}



/**
 * 编译 Typescript 代码到 js
 * @param source Typescript 源代码
 */
export function compileTs2js(source: string) {
  const jscode = ts.transpile(source, {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2017,
    removeComments: true,
  })

  return jscode
}
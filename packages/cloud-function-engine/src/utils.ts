import * as ts from 'typescript'

// 获取当前时间戳，毫秒
export function now(): number {
  return Date.now()
}

// 纳秒转毫秒
export function nanosecond2ms(nanoseconds: bigint): number {
  // 先除 1000，去掉纳秒小数点
  const _t = nanoseconds / BigInt(1000)

  // 再用 float 除1000，保留微秒小数点
  const ret = parseFloat(_t.toString()) / 1000
  return ret
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
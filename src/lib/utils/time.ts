
// 获取当前时间，整数，秒
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
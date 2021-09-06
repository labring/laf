/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-18 16:46:04
 * @Description: 
 */


// Turn nanoseconds into milliseconds
export function nanosecond2ms(nanoseconds: bigint): number {
  // divide by 1000, get rid of the nanosecond decimal
  const _t = nanoseconds / BigInt(1000)

  // Divide 1000 in float, keeping the microsecond decimal point
  const ret = parseFloat(_t.toString()) / 1000
  return ret
}

/**
 * Convert an array to map
 * @param {Array} arr the original array
 * @param {string} mapKey the key of map from object in array
 * @param {boolean} unique if the value pointed by key is unique. default is true, if false given, the value will be an array
 */
export function array2map(arr: any[], mapKey: string, unique = true): any {
  const map = {}
  for (const el of arr) {
    const key = el[mapKey]
    if (unique) {
      map[key] = el ?? null
    } else {
      map[key] = map[key] ?? []
      map[key].push(el)
    }
  }
  return map
}

/**
 * Merge an map to an array by the value of `mapKey`
 * @param {*} map the map object
 * @param {*} arr target array
 * @param {*} mapKey the map key to linked arr with map
 * @param {*} as the new field key which will be inserted to target array
 * @returns
 */
export function mergeMap2ArrayByKey(map: any, arr: any[], mapKey: string, as: string) {
  as = as ?? mapKey

  for (const el of arr) {
    const key = el[mapKey]
    el[as] = map[key]
  }

  return arr
}

/**
 * Merge an map to an array by the values of `mapKey`
 * @param {*} map the map object
 * @param {*} arr target array
 * @param {*} mapKey the map key to linked arr with map
 * @param {*} as the new field key which will be inserted to target array
 * @returns
 */
export function mergeMap2ArrayByKeyArray(map: any, arr: any[], mapKey: string, as: string) {
  as = as ?? mapKey

  for (const el of arr) {
    const sub_arr = el[mapKey] || []
    const rets = sub_arr.map(s => map[s])
    el[as] = rets
  }

  return arr
}

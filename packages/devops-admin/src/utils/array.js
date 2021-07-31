
/**
 * 将数组转换成映射表(Map)
 * @param {Array} arr 原数组
 * @param {string} mapKey 数组元素的映射键
 * @param {boolean} unique 映射键值是否唯一，默认为 true；如果为 false，则映射值为数组
 */
export function array2map(arr, mapKey, unique = true) {
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
 * 将映射表合并到数组，即映射表中的键值插入到数组元素中对应的键中
 * @param {*} map 映射表
 * @param {*} arr 数组
 * @param {*} mapKey 数组元素的映射键
 * @param {*} as 结果字段名
 * @returns
 */
export function mergeMap2ArrayByKey(map, arr, mapKey, as) {
  as = as ?? mapKey

  for (const el of arr) {
    const key = el[mapKey]
    el[as] = map[key]
  }

  return arr
}

/**
 * 功能同 @applyMap2array ，区别在于，映射键值为数组
 * @param {*} map 映射表
 * @param {*} arr 数组
 * @param {*} mapKey 数组元素的映射键
 * @param {*} as 结果字段名
 * @returns
 */
export function mergeMap2ArrayByKeyArray(map, arr, mapKey, as) {
  as = as ?? mapKey

  for (const el of arr) {
    const sub_arr = el[mapKey] || []
    const rets = sub_arr.map(s => map[s])
    el[as] = rets
  }

  return arr
}

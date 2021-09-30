const assert = require('assert')

// 只要求值一致，不关心顺序
function compareArray(arr1, arr2) {
  assert.strictEqual(arr1.length, arr2.length, `compareArray() length: ${arr1.length}) should be equal ${arr2.length}`)
  for (let item of arr1) {
    assert(arr2.includes(item), `compareArray() ${item} in arr1 not present in arr2`)
  }
}

// 要求数据值和顺序都一致
function strictCompareArray(arr1, arr2) {
  assert.strictEqual(arr1.length, arr2.length, `array length: ${arr1.length}) should be equal ${arr2.length}`)
  for (let i = 0; i < arr2.length; i++) {
    assert.strictEqual(arr1[i], arr2[i], `array length: arr1[${i}] not equal to arr2[${i}]`)
  }
}


module.exports = {
  compareArray,
  strictCompareArray
}
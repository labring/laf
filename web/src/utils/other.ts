let timer: NodeJS.Timeout, flag: boolean;
/**
 * 节流原理：在一定时间内，只能触发一次
 * @param {() => any} func 要执行的回调函数
 * @param {number} [wait=500] 延时的时间
 * @param {boolean} [immediate=true] 是否立即执行
 * @example
 *  const handleEdit = (index: any, row: any) => {
 *      debounce(
 *          () => {
 *              console.log(index, row)
 *          },
 *          1000,
 *          true
 *      )
 *  }
 */
function useThrottle(func: () => any, wait: number = 500, immediate: boolean = true) {
  if (immediate) {
    if (!flag) {
      flag = true;
      // 如果是立即执行，则在wait毫秒内开始时执行
      typeof func === "function" && func();
      timer = setTimeout(() => {
        flag = false;
      }, wait);
    }
  } else {
    if (!flag) {
      flag = true;
      // 如果是非立即执行，则在wait毫秒内的结束处执行
      timer = setTimeout(() => {
        flag = false;
        typeof func === "function" && func();
      }, wait);
    }
  }
}

let timeout: NodeJS.Timeout | null = null;
/**
 * 防抖原理：一定时间内，只有最后一次操作，再过wait毫秒后才执行函数
 * @param {() => any} func 要执行的回调函数
 * @param {number} [wait=500] 延时的时间
 * @param {boolean} [immediate=false] 是否立即执行
 */
function useDebounce(func: () => any, wait: number = 500, immediate: boolean = false) {
  // 清除定时器
  if (timeout !== null) clearTimeout(timeout);
  // 立即执行，此类情况一般用不到
  if (immediate) {
    let callNow = !timeout;
    timeout = setTimeout(function () {
      timeout = null;
    }, wait);
    if (callNow) typeof func === "function" && func();
  } else {
    // 设置定时器，当最后一次操作后，timeout不会再被清除，所以在延时wait毫秒后执行func回调方法
    timeout = setTimeout(function () {
      typeof func === "function" && func();
    }, wait);
  }
}

export { useThrottle, useDebounce };

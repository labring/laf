import { uniqueId } from 'lodash'
import type { Ref } from 'vue'

/**
 * 页面通用的 loading 解决方案
 * 支持从 request、fn、ref 加载loading
 * @returns
 */
export function useLoading() {
  const loadingQueue = ref(new Set<string>())
  const loading = computed(() => loadingQueue.value.size > 0)

  /**
   * 执行异步函数时，自动加载状态
   * @param fn
   * @returns
   */
  function withAsyncLoading<T extends (...args: any) => Promise<any>>(fn: T) {
    return async function withAsyncLoadingWrapper(...args: any[]) {
      const uid = uniqueId('')
      loadingQueue.value.add(uid)
      return fn(...args)
        .then((res) => {
          loadingQueue.value.delete(uid)
          return res
        })
        .catch((res) => {
          loadingQueue.value.delete(uid)
          return Promise.reject(res)
        })
    } as T
  }
  /**
   * 执行同步函数时，自动加载状态
   * @param fn
   * @returns
   */
  function withSyncLoading<T extends (...args: any) => any>(fn: T) {
    return function withSyncLoadingWrapper(...args: any[]) {
      const uid = uniqueId('')
      loadingQueue.value.add(uid)
      const ret = fn(...args)
      nextTick(() => {
        loadingQueue.value.delete(uid)
      })
      return ret
    } as T
  }

  /**
   * 执行请求时，自动加载状态
   * @param req
   * @returns
   */
  function withRequestLoading<T extends { loading: Ref<boolean> }>(req: T) {
    const uid = uniqueId()
    watch(req.loading, (value) => {
      if (value)
        loadingQueue.value.add(uid)

      else
        loadingQueue.value.delete(uid)
    })
    return req
  }

  /**
   * 从 ref 中加载状态
   * @param val
   * @param condition
   * @returns
   */
  function withLoadingRef<T>(
    val: Ref<T>,
    condition: (val: T) => boolean = val => !!val,
  ) {
    const uid = uniqueId()
    watch(val, (value) => {
      if (condition(value))
        loadingQueue.value.add(uid)

      else
        loadingQueue.value.delete(uid)
    })
    return val
  }
  return {
    loading,
    withRequestLoading,
    withAsyncLoading,
    withSyncLoading,
    withLoadingRef,
  }
}

export function useLoadingService(fullscreen = true, text = '') {
  let loadingService: any
  const loading = useLoading()
  watch(loading.loading, (value) => {
    if (value) {
      loadingService = ElLoading.service({
        fullscreen,
        text,
      })
    }
    else if (loadingService) {
      loadingService.close()
    }
  })
  return loading
}

import { UnwrapRef } from 'vue'

/**
 * 对 model 类型数据的访问和更新做封装
 * 这个函数会使用初值创建一个新的 ref，无论更新事件是否正确触发，都会 **在内部保存一份最新的数据**
 * 当未使用 v-model或者未绑定 `@update:xxx` 事件时，修改返回的 ref 仍然有效
 * @param props 组件的 props 对象
 * @param key 组件 props 的 key
 * @param emit 组件的 emit 函数
 * @returns 对 model 数据的引用
 */
export const useModel = <
  P extends Record<string | number, any>,
  E extends (...args: any[]) => any,
  K extends keyof P
>(
  props: P,
  key: K,
  emit: E
) => {
  const modelValue = ref<P[K]>(props[key])
  watch(
    () => props[key],
    (val) => {
      modelValue.value = val as UnwrapRef<P[K]>
    }
  )

  watch(modelValue, (newVal, oldVal) => {
    if (newVal === oldVal) return
    emit(`update:${key}`, newVal)
  })

  return modelValue
}

/**
 * 对 model 类型数据的访问和更新做封装
 * 这个函数不会创建 ref，数据直接引用 props[key]。
 * 当未使用 v-model或者未绑定 `@update:xxx` 事件时，修改返回的 ref 不会生效
 * @param props 组件的 props 对象
 * @param key 组件 props 的 key
 * @param emit 组件的 emit 函数
 * @returns 对 model 数据的引用
 */
export const useModelRef = <
  P extends Record<string | number, any>,
  E extends Function,
  K extends keyof P
>(
  props: P,
  key: K,
  emit: E
) => {
  return computed<P[K]>({
    get() {
      return props[key]
    },
    set(val) {
      emit('update:' + key, val)
    },
  })
}

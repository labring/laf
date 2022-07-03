import { resolve } from 'path'
import type { RouteRecordRaw } from 'vue-router'
import { resolveComponentNameByPath } from './utils'

/**
 * 所有路由自动增加 meta 信息，对应路由的组件名
 * @param route
 * @returns
 */
export default function extendRoute(route: RouteRecordRaw) {
  if (!route.component)
    return route
  const fileName = route.component as any as string
  const routeName = route.name as string
  // update route.name
  route.name = routeName.split('-').join('.')
  // update route.meta
  route.meta = {
    ...route.meta,
    componentName: resolveComponentNameByPath(resolve(process.cwd(), `.${fileName}`)),
  }
  return route
}

import { acceptHMRUpdate, defineStore } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'

/**
 * 多 tab 支持
 */
export const useTabStore = defineStore('tab', () => {
  const visitedViews = ref<RouteLocationNormalized[]>([])
  const cachedViews = ref<string[]>([])

  function addView (view: RouteLocationNormalized) {
    if (!visitedViews.value.includes(view)) { visitedViews.value.push(view) }

    if (!cachedViews.value.includes(view.meta.componentName)) { cachedViews.value.push(view.meta.componentName) }
  }

  function deleteView (view: RouteLocationNormalized) {
    visitedViews.value = visitedViews.value.filter(v => v.path !== view.path)
    cachedViews.value = cachedViews.value.filter(v => v !== view.meta.componentName)
  }

  function clearView () {
    visitedViews.value = []
    cachedViews.value = []
  }

  function updateView (view: RouteLocationNormalized) {
    for (let i = 0; i < visitedViews.value.length; i++) {
      if (visitedViews.value[i].path === view.path) {
        visitedViews.value[i] = view
        break
      }
    }
  }

  function getView (view: RouteLocationNormalized) {
    return visitedViews.value.find(v => v.path === view.path)
  }

  function getViewIndex (view: RouteLocationNormalized) {
    return visitedViews.value.findIndex(v => v.path === view.path)
  }

  function getRouteLocation (view: RouteLocationNormalized) {
    return { path: view.path, query: view.query }
  }

  return {
    visitedViews,
    cachedViews,
    addView,
    deleteView,
    getViewIndex,
    clearView,
    updateView,
    getView,
    getRouteLocation
  }
})

if (import.meta.hot) { import.meta.hot.accept(acceptHMRUpdate(useTabStore, import.meta.hot)) }

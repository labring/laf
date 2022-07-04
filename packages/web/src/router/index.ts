import { createRouter, createWebHashHistory } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import generatedRoutes from '~pages'

export const routes = setupLayouts(generatedRoutes)
export const appRoutes = routes.filter(route => route.path.startsWith('/app/'))

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

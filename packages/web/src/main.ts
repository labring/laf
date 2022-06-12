import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from '~/router'
import { i18n } from '~/locates'

import '@unocss/reset/tailwind.css'
import './styles/main.css'
import 'uno.css'

import '~/router/permission'

const pinia = createPinia()

const app = createApp(App)
app.use(pinia).use(i18n).use(router).mount('#app')

for (const [key, component] of Object.entries(ElementPlusIconsVue))
  app.component(key, component)


import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from '~/router'
import { i18n } from '~/modules/locales'

import '@unocss/reset/tailwind.css'
import './styles/main.css'
import 'uno.css'
import 'element-plus/dist/index.css'


import '~/router/permission'
import { parseTime } from '~/utils'

const pinia = createPinia()

const app = createApp(App)
app.use(pinia).use(i18n).use(router).mount('#app')

app.config.globalProperties.$filters = {
  parseTime(time: string | Date, cFormat: string) {
    return parseTime(time, cFormat)
  }
}

for (const [key, component] of Object.entries(ElementPlusIconsVue))
  app.component(key, component)


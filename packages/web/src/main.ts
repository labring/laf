import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { i18n } from '~/modules/locales'
import router from '~/router'

import '@unocss/reset/tailwind.css'
import 'uno.css'
import './styles/main.scss'

import '~/router/permission'
import { parseTime } from '~/utils'

const pinia = createPinia()

const app = createApp(App)
app.use(pinia).use(i18n).use(router).mount('#app')

app.config.globalProperties.$filters = {
  parseTime(time: string | Date, cFormat: string) {
    return parseTime(time, cFormat)
  },
}

for (const [key, component] of Object.entries(ElementPlusIconsVue))
  app.component(key, component)


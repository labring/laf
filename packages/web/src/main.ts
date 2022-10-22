import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import dayjs from 'dayjs'
import App from './App.vue'
import { i18n } from '~/modules/locales'
import router from '~/router'

import '@unocss/reset/tailwind.css'
import 'uno.css'
import './styles/main.scss'

import '~/router/permission'

const pinia = createPinia()

const app = createApp(App)
app.use(pinia).use(i18n).use(router)

if (process.env.NODE_ENV === 'development')
  import('./styles/element/theme.dev.scss').then(() => app.mount('#app'))
else
  app.mount('#app')

app.config.globalProperties.$filters = {
  formatTime(time: string | Date, cFormat = 'YYYY-MM-DD HH:mm:ss') {
    return dayjs(time).format(cFormat)
  },
}

for (const [key, component] of Object.entries(ElementPlusIconsVue))
  app.component(key, component)


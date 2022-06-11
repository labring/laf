import { createI18n } from 'vue-i18n'
import messages from '@intlify/vite-plugin-vue-i18n/messages'

export const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages,
})

export const supportLanguages = [
  {
    name: 'zh-CN',
    text: '简体中文',
  },
  {
    name: 'en',
    text: 'English',
  },
]

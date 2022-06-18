import { createI18n } from 'vue-i18n'
import messages from '@intlify/vite-plugin-vue-i18n/messages'
import { getUserLocales } from 'get-user-locale'
import { intersection } from 'lodash'
import { useConfigStore } from '~/store'

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

export const supportLanguageNames = supportLanguages.map(item => item.name)

export const t = i18n.global.t.bind(i18n.global)

// 检测浏览器中的默认语言
export const userLocales = getUserLocales()

// 共有的语言
const commonLanguages = intersection(userLocales, supportLanguageNames)

// 最佳的默认语言
export const bestDefaultLanguage = commonLanguages.length > 0 ? commonLanguages[0] : 'en'

export function initLanguageModule() {
  // 同步语言设置
  const { locale } = useI18n()
  const config = useConfigStore()
  watchEffect(() => {
    locale.value = config.local.language
  })
}

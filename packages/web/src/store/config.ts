import { acceptHMRUpdate, defineStore } from 'pinia'
import { bestDefaultLanguage } from '~/modules/locales'

export const useConfigStore = defineStore('config', () => {
  const local = useLocalStorage('laf-config-local', {
    language: bestDefaultLanguage,
  })

  return { local }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useConfigStore, import.meta.hot))

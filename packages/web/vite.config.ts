import path from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Unocss from 'unocss/vite'
import ElementPlus from 'unplugin-element-plus/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import vueI18n from '@intlify/vite-plugin-vue-i18n'
// import Inspect from 'vite-plugin-inspect'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'
import SFCName from './scripts/vite-plugin-vue-sfc-name'

import extendRoute from './scripts/extend-route'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
      './runtimeConfig': './runtimeConfig.browser',
    },
  },
  plugins: [
    // debug plugins only
    // Inspect(),
    SFCName(),
    Vue({
      reactivityTransform: true,
    }),
    vueI18n({
      // if you want to use Vue I18n Legacy API, you need to set `compositionOnly: false`
      // compositionOnly: false,

      // you need to set i18n resource including paths !
      include: path.resolve(__dirname, './locales/**'),
      compositionOnly: false,

      defaultSFCLang: 'yml',
    }),

    // https://github.com/hannoeru/vite-plugin-pages
    Pages({
      extendRoute,
      dirs: [
        { dir: path.resolve(__dirname, './src/pages'), baseRoute: '' },
        { dir: path.resolve(__dirname, './src/pages/account'), baseRoute: '' },
      ],
      exclude: ['**/components/**.vue', '**/layouts/**.vue', '**/*.ts'],
    }),

    Layouts({
      layoutsDirs: path.resolve(__dirname, './src/layout'),
      defaultLayout: 'default',
    }),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: ['vue', 'vue/macros', 'vue-router', '@vueuse/core', 'vue-i18n'],
      dts: true,
      resolvers: [ElementPlusResolver()],
    }),

    ElementPlus({
      useSource: true,
    }),

    // https://github.com/antfu/vite-plugin-components
    Components({
      dts: true,
      resolvers: [ElementPlusResolver()],
    }),

    // https://github.com/antfu/unocss
    // see unocss.config.ts for config
    Unocss(),

    monacoEditorPlugin({
      languageWorkers: ['typescript', 'json'],
    }),
  ],

  // https://github.com/vitest-dev/vitest
  test: {
    environment: 'jsdom',
  },

  // server
  server: {
    proxy: {
      '/sys-api': {
        target: 'http://console.127-0-0-1.nip.io:8080/',
        changeOrigin: true,
      },
      '/sys-extension-api': {
        target: 'http://console.127-0-0-1.nip.io:8080/',

        changeOrigin: true,
      },
    },
  },

  build: {
    rollupOptions: {
      external: [],
    },
  },

})

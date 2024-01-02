//vite.config.js
import { defineConfig } from 'vite'
import { SearchPlugin } from 'vitepress-plugin-search'

export default defineConfig({
  base: './',
  server: {
    port: 5173,
    hmr: false,
    disableHostCheck: true,
  },
  plugins: [
    SearchPlugin({
      encode: false,
      tokenize: 'full',
      previewLength: 62,
      buttonLabel: 'Search',
      placeholder: 'Search docs',
      cache: true,
      context: false,
    }),
  ],
})

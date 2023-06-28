//vite.config.js
import { SearchPlugin } from "vitepress-plugin-search";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  server: {
    port: 5173,
    hmr: false,
    disableHostCheck: true,
  },
  plugins: [
    SearchPlugin({
      encode: false,
      tokenize: "full",
      previewLength: 62,
      buttonLabel: "Search",
      placeholder: "Search docs",
      cache: true,
      context: false,
    }),
  ],
});

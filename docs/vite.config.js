// vite.config.js
export default {
  // config options
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['.'],
      strict: false
    }
  }
}
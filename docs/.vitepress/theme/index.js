import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // register global components
    // app.component('MyGlobalComponent' /* ... */)
  }
}

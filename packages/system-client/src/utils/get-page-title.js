import defaultSettings from '@/settings'
import store from '@/store'

const title = defaultSettings.title

export default function getPageTitle(pageTitle) {
  const app = store.state.app.application
  if (app) {
    return `${pageTitle} - ${app.name}`
  }
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}

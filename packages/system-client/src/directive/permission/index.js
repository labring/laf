import permission from './permission'

const install = (Vue) => {
  console.log('install permission directive')
  Vue.directive('permission', permission)
}

if (window.Vue) {
  window['permission'] = permission
  Vue.use(install); // eslint-disable-line
}

permission.install = install
export default permission

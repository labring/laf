import role from './role'

const install = (Vue) => {
  console.log('install role directive')
  Vue.directive('role', role)
}

if (window.Vue) {
  window['role'] = role
  Vue.use(install); // eslint-disable-line
}

role.install = install
export default role

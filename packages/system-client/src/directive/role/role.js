import store from '@/store'

function checkRole(el, binding) {
  let { value } = binding
  const roles = store.getters && store.getters.roles

  if (typeof value === 'string') {
    value = [value]
  }

  if (value instanceof Array) {
    if (value.length > 0) {
      const needRoles = value

      const hasRole = roles.some(perm => {
        return needRoles.includes(perm)
      })

      if (!hasRole) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  } else {
    throw new Error(`need roles! Like v-role="['admin','editor'] or v-role="'admin'"`)
  }
}

export default {
  inserted(el, binding) {
    checkRole(el, binding)
  },
  update(el, binding) {
    checkRole(el, binding)
  }
}

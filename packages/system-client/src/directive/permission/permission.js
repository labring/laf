import store from '@/store'

function checkPermission(el, binding) {
  let { value } = binding
  const permissions = store.getters && store.getters.permissions

  if (typeof value === 'string') {
    value = [value]
  }

  if (value instanceof Array) {
    if (value.length > 0) {
      const needPermissions = value

      const hasPermission = permissions.some(perm => {
        return needPermissions.includes(perm)
      })

      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  } else {
    throw new Error(`need permissions! Like v-permission="['admin.create','admin.edit'] or v-permission="admin.edit"`)
  }
}

export default {
  inserted(el, binding) {
    checkPermission(el, binding)
  },
  update(el, binding) {
    checkPermission(el, binding)
  }
}

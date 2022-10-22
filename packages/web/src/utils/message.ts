import { t } from '~/modules/locales'

export function successMsg(message?: string) {
  message = message || t('utils.message.success.default-message')
  return ElMessage.success({
    message,
    showClose: true,
    grouping: true,
  })
}

export function errorMsg(message?: string) {
  message = message || t('utils.message.error.default-message')
  return ElMessage.error({
    message,
    showClose: true,
    grouping: true,
  })
}

export function warnMsg(message: string) {
  return ElMessage.warning({
    message,
    showClose: true,
    grouping: true,
  })
}

export function withConfirm(
  fn: () => any,
  message?: string,
  title?: string,
) {
  message = message || t('utils.message.confirm.default-message')
  title = title || t('utils.message.confirm.default-title')
  return function handleWithConfirm() {
    return ElMessageBox.confirm(message, title, {
      type: 'warning',
      confirmButtonText: t('utils.message.confirm.buttons.confirm'),
      cancelButtonText: t('utils.message.confirm.buttons.cancel'),
    })
      .then(() => {
        return fn()
      })
      .catch((err: any) => {
        console.error(err)
      })
  }
}

export const confirmAsync = ElMessageBox.confirm

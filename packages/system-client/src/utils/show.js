import { Message, Notification } from 'element-ui'

export function showSuccess(message) {
  Message.success(message)
}

export function showError(message) {
  Message.error(message)
}

export function showInfo(message) {
  Message.info(message)
}

export function showWarning(message) {
  Message.warning(message)
}

export function notifySuccess(message, title) {
  Notification.success({ message, title })
}

export function notifyError(message, title) {
  Notification.error({ message, title })
}

export function notifyInfo(message, title) {
  Notification.info({ message, title })
}

export function notifyWarning(message, title) {
  Notification.warning({ message, title })
}

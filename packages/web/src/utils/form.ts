import type { FormItemRule } from 'element-plus'
import { i18n } from '~/modules/locales'

export function requiredField(name: string): FormItemRule {
  return { trigger: 'blur', required: true, message: i18n.global.t('utils.form.required', { name }) }
}

export function passwordField(name: string): FormItemRule {
  return {
    trigger: 'blur',
    min: 8,
    message: i18n.global.t('utils.form.password', { name }),
  }
}

export function emailField(name: string): FormItemRule {
  return {
    type: 'email',
    message: i18n.global.t('utils.form.email', { name }),
  }
}

export function minLengthField(len: number, name: string): FormItemRule {
  return {
    trigger: 'blur',
    min: len,
    message: i18n.global.t('utils.form.minlength', { name, len }),
  }
}

export function maxLengthField(len: number, name: string): FormItemRule {
  return {
    trigger: 'blur',
    max: len,
    message: i18n.global.t('utils.form.maxlength', { name, len }),
  }
}

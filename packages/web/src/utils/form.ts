import type { FormItemRule } from 'element-plus'

export function requiredField(name: string): FormItemRule {
  return { trigger: 'blur', required: true, message: `${name}不能为空` }
}

export function passwordField(name: string): FormItemRule {
  return {
    trigger: 'blur',
    min: 8,
    message: `${name}至少八位`,
  }
}

export function emailField(name: string): FormItemRule {
  return {
    type: 'email',
    message: `${name}格式不正确`,
  }
}

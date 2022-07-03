<script lang="ts" setup>
import type { ElForm } from 'element-plus'
import { resetPassword } from '~/api/user'
import { useUserStore } from '~/store'
import { passwordField, requiredField } from '~/utils/form'
import { successMsg } from '~/utils/message'

const emit = defineEmits<{
  (type: 'done'): void
}>()

const { t } = useI18n()

const formEl = ref<typeof ElForm>()
const dialogVisible = ref(false)
const userStore = useUserStore()
const formData = reactive({
  accountId: userStore.userProfile._id,
  password: '',
  confirmPassword: '',
})

const open = () => dialogVisible.value = true
const close = () => dialogVisible.value = false

const submitForm = () => {
  formEl.value?.validate()
  resetPassword(formData).then(() => {
    close()
    successMsg()
    emit('done')
  })
}

const confirmPasswordRule = {
  trigger: 'blur',
  validator: (rule: any, value: string, callback: any) => {
    if (value !== formData.password)
      callback(new Error(t('layout.components.reset-password.rules.confirm')))

    else
      callback()
  },
}

defineExpose({ open, close })
</script>

<template>
  <el-dialog ref="dialogEl" v-model="dialogVisible" destroy-on-close append-to-body :close-on-click-modal="false" :close-on-press-escape="false" title="重置密码">
    <el-form ref="formEl" label-position="top" :model="formData">
      <el-form-item
        :label="$t('layout.components.reset-password.form.new-password')"
        prop="password"
        :rules="[
          passwordField($t('layout.components.reset-password.form.new-password')),
          requiredField($t('layout.components.reset-password.form.new-password')),
        ]"
      >
        <el-input
          v-model="formData.password"
          type="password"
          clearable
          auto-complete="off"
        />
      </el-form-item>
      <el-form-item
        :label="$t('layout.components.reset-password.form.confirm-password')"
        prop="confirmPassword" :rules="[
          passwordField($t('layout.components.reset-password.form.confirm-password')),
          requiredField($t('layout.components.reset-password.form.confirm-password')),
          confirmPasswordRule,
        ]"
      >
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          clearable
          auto-complete="off"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="submitForm">
        {{ $t('utils.form.submit') }}
      </el-button>
    </template>
  </el-dialog>
</template>

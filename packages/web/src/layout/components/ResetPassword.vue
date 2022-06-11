<script lang="ts" setup>
import type { ElForm } from 'element-plus'
import { resetPassword } from '~/api/user'
import { useUserStore } from '~/store'
import { passwordField, requiredField } from '~/utils/form'

const emit = defineEmits<{
  (type: 'done'): void
}>()

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
    ElMessage.success('密码修改成功!')
    emit('done')
  })
}

const confirmPasswordRule = {
  trigger: 'blur',
  validator: (rule: any, value: string, callback: any) => {
    if (value !== formData.password)
      callback(new Error('两次密码不一致!'))

    else
      callback()
  },
}

defineExpose({ open, close })
</script>

<template>
  <el-dialog ref="dialogEl" v-model="dialogVisible" destroy-on-close append-to-body :close-on-click-modal="false" :close-on-press-escape="false" title="重置密码">
    <el-form ref="formEl" :model="formData">
      <el-form-item label="新的密码" prop="password" :rules="[passwordField('新密码'), requiredField('新密码')]">
        <el-input
          v-model="formData.password"
          placeholder="请输入密码"
          type="password"
          clearable
          auto-complete="off"
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword" :rules="[passwordField('确认密码'), requiredField('确认密码'), confirmPasswordRule]">
        <el-input
          v-model="formData.confirmPassword"
          placeholder="请输入确认密码"
          type="password"
          clearable
          auto-complete="off"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="submitForm">
        提交
      </el-button>
    </template>
  </el-dialog>
</template>

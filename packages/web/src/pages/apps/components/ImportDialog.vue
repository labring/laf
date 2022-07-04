<script setup lang="ts">
import * as appAPI from '~/api/application'

const props = defineProps<{
  isVisible: boolean
  app: any
}>()

const emit = defineEmits(['closeImportDialog'])

const { isVisible } = toRefs(props)

const importForm = reactive({
  app: null,
  file: null,
})
const importFormRules = {
  app: [{ required: true, message: '没选择应用', trigger: 'blur' }],
  file: [{ required: true, message: '请选择导入文件', trigger: 'blur' }],
}

const initImportForm = () => {
  importForm.app = null
  importForm.file = null
}

watchEffect(() => {
  importForm.app = props.app
})

const onImportFileChanged = (data) => {
  const file = data.raw
  importForm.file = file
}

const importDialogLoading = ref(false)
const handleImportApp = (formEl: any) => {
  if (!formEl)
    return

  formEl.validate(async (valid: boolean) => {
    if (!valid)
      return

    if (!importForm.file || !importForm.app)
      return

    importDialogLoading.value = true
    const { file, app } = importForm
    const { appid } = app
    const res = await appAPI.importApplication(appid, file)
    if (res.error) {
      ElMessage.error(`导入失败:${res.error}`)
      return
    }

    // 重启应用
    await appAPI.restartApplicationInstance(appid)

    importDialogLoading.value = false
    ElMessage.success('导入应用成功!')
    initImportForm()
    emit('closeImportDialog')
  })
}
</script>

<template>
  <el-dialog v-model="isVisible" title="导入应用" @close="$emit('closeImportDialog')">
    <el-form
      ref="importFormRef"
      :rules="importFormRules"
      :model="importForm"
      label-position="left"
      label-width="120px"
      style="width: 300px; margin-left:20px;"
    >
      <el-form-item label="应用" prop="app">
        {{ importForm.app?.name }}
      </el-form-item>
      <el-form-item label="选择应用文件" prop="file">
        <el-upload
          ref="uploader"
          action=""
          :auto-upload="false"
          :multiple="false"
          :show-file-list="true"
          accept=".lapp"
          :limit="1"
          :on-change="onImportFileChanged"
        >
          <el-button slot="trigger" plain size="small" type="primary">
            选取导入文件
          </el-button>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('closeImportDialog')">
        取消
      </el-button>
      <el-button :loading="importDialogLoading" type="primary" @click="handleImportApp(importFormRef)">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

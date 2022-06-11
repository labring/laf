<script setup lang="ts">
import AppTable from './components/AppTable.vue'
import CreateDialog from './components/CreateDialog.vue'
import ImportDialog from './components/ImportDialog.vue'
import { useTable } from './hooks/useTable'
import { useCreateDialog } from './hooks/useCreateDialog'
import { useImportDialog } from './hooks/useImportDialog'

const {
  createdApps,
  joinedApps,
  specs,
  loading,
  getApplications,
  getSpecs,
} = useTable()

const {
  currentCreateApp,
  createDialogVisible,
  createFormType,
  showCreateDialog,
  showUpdateDialog,
} = useCreateDialog()

const {
  importDialogVisible,
  currentImportApp,
  showImportDialog,
} = useImportDialog()

onMounted(() => {
  getApplications()
  getSpecs()

  // setInterval(() => { getApplications(true) }, 5000)
})
</script>

<template>
  <div p-4 :loading="loading">
    <div mb-2>
      <el-button type="default" plain @click="getApplications()">
        刷新
      </el-button>
      <el-button type="primary" plain @click="showCreateDialog">
        创建应用
      </el-button>
    </div>

    <AppTable
      type="created"
      :apps="createdApps"
      :loading="loading"
      @show-update-dialog="showUpdateDialog"
      @show-import-dialog="showImportDialog"
      @get-applications="getApplications"
    />

    <AppTable
      type="joined"
      :apps="joinedApps"
      :loading="loading"
      @show-update-dialog="showUpdateDialog"
      @show-import-dialog="showImportDialog"
      @get-applications="getApplications"
    />

    <CreateDialog
      :type="createFormType"
      :specs="specs"
      :is-visible="createDialogVisible"
      :app="currentCreateApp"
      @close-create-dialog="createDialogVisible = false"
      @get-applications="getApplications"
    />

    <ImportDialog
      :is-visible="importDialogVisible"
      :app="currentImportApp"
      @close-import-dialog="importDialogVisible = false"
    />
  </div>
</template>

<route lang="yaml">
name: applications
meta:
  layout: TopBarLayout
  requiresAuth: true
  title: 应用管理
</route>

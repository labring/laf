export const useCreateDialog = () => {
  const currentApp = ref({})
  const createDialogVisible = ref(false)
  const createFormType = ref('create')

  const showCreateDialog = () => {
    createDialogVisible.value = true
    createFormType.value = 'create'
  }
  const showUpdateDialog = (app: any) => {
    currentApp.value = app
    createDialogVisible.value = true
    createFormType.value = 'update'
  }

  return {
    currentCreateApp: currentApp,
    createDialogVisible,
    createFormType,
    showCreateDialog,
    showUpdateDialog,
  }
}

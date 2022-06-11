export const useImportDialog = () => {
  const importDialogVisible = ref(false)
  const currentApp = ref({})
  const showImportDialog = (app: any) => {
    currentApp.value = app
    importDialogVisible.value = true
  }

  return {
    importDialogVisible,
    currentImportApp: currentApp,
    showImportDialog,
  }
}

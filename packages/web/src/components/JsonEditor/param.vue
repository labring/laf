<script setup lang="ts">
import { defineEmits, defineProps, onMounted, ref, toRaw } from 'vue'
import * as monaco from 'monaco-editor'
const props = defineProps({
  modelValue: String,
  height: Number,
})

const emit = defineEmits(['update:modelValue'])

const dom = ref()

let editorInstance: monaco.editor.IStandaloneCodeEditor
onMounted(() => {
  const jsonModel = monaco.editor.getModels()[0] || monaco.editor.createModel(
    JSON.stringify(props.modelValue, null, 2) || '',
    'json',
    monaco.Uri.parse('json://grid/settings.json'),
  )

  editorInstance = monaco.editor.create(dom.value, {
    model: jsonModel,
    minimap: {
      enabled: false,
    },
    tabSize: 2,
    fontSize: 12,
    automaticLayout: true,
    scrollBeyondLastLine: false,
  })

  editorInstance.onDidChangeModelContent(() => {
    const value = editorInstance.getValue()
    emit('update:modelValue', value)
  })
})

watch(() => props.modelValue, (value) => {
  if (toRaw(value) !== editorInstance?.getValue())
    editorInstance.setValue(JSON.stringify(toRaw(value), null, 2) || '')
})

onDeactivated(() => {
  editorInstance.dispose()
  monaco.editor.getModels().forEach(model => model.dispose())
})

onUnmounted(() => {
  editorInstance.dispose()
  monaco.editor.getModels().forEach(model => model.dispose())
})

// onUpdated(() => {
//   editorInstance.setValue(JSON.stringify(props.modelValue, null, 2))
// })
</script>

<template>
  <div ref="dom" class="editor" />
</template>

<style scoped>
.editor {
  height: 100%;
  width: 100%;
}
</style>

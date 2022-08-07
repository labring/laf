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

function initEditor() {
  let _value = props.modelValue || ''
  if (typeof props.modelValue === 'object')
    _value = JSON.stringify(props.modelValue, null, 2)

  editorInstance = monaco.editor.create(dom.value, {
    value: _value,
    language: 'json',
    fontSize: 12,
    lineNumbers: 'on',
    roundedSelection: true,
    scrollBeyondLastLine: false,
    readOnly: false,
    theme: 'vs',
    fontWeight: 'bold',
    smoothScrolling: true,
    renderWhitespace: 'selection',
  })

  editorInstance.onDidChangeModelContent(() => {
    const value = editorInstance.getValue()
    emit('update:modelValue', value)
  })
}

onMounted(() => {
  nextTick(() => {
    initEditor()
  })
})

watch(() => props.modelValue, (value) => {
  if (toRaw(value) !== editorInstance?.getValue())
    editorInstance.setValue(JSON.stringify(toRaw(value), null, 2))
})
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

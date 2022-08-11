<script setup lang="ts">
import { defineEmits, defineProps, onMounted, ref, toRaw } from 'vue'
import * as monaco from 'monaco-editor'

const props = defineProps({
  modelValue: String,
  height: Number,
  lineNumbers: Boolean,
})
const emit = defineEmits(['update:modelValue'])

const minHeight = computed(() => {
  return props.height || 150
})

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
    lineNumbers: props.lineNumbers ? 'on' : 'off',
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

onDeactivated(() => {
  editorInstance.dispose()
})

onUnmounted(() => {
  editorInstance.dispose()
})
</script>

<template>
  <div ref="dom" class="editor" :style="{ minHeight: `${minHeight}px` }" />
</template>

<style scoped>
.editor {
  height: 100%;
  width: 100%;
}
</style>

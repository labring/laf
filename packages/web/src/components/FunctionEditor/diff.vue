<script lang="ts" setup>
import * as monaco from 'monaco-editor'

const props = defineProps({
  original: {
    type: String,
    default: '',
  },
  modified: {
    type: String,
    default: '',
  },
  height: {
    type: Number,
    default: 300,
  },
  dark: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    default: () => {
      return `index-${Date.now()}.ts`
    },
  },
})

const editorDomRef = ref()

let editorInstance: monaco.editor.IStandaloneDiffEditor

function initEditor() {
  const originalModel = monaco.editor.createModel(props.original, 'typescript', monaco.Uri.parse(`diff-${Math.random()}.ts`))
  const modifiedModel = monaco.editor.createModel(props.modified, 'typescript', monaco.Uri.parse(`diff-${Math.random()}.ts`))

  editorInstance = monaco.editor.createDiffEditor(editorDomRef.value, {
    enableSplitViewResizing: false,
    lineNumbers: 'on',
    roundedSelection: true,
    scrollBeyondLastLine: false,
    theme: props.dark ? 'vs-dark' : 'vs',
    readOnly: true,
    formatOnType: true,
    fontSize: 12,
    linkedEditing: true,
    cursorBlinking: 'expand',
    smoothScrolling: true,
    renderWhitespace: 'selection',
    automaticLayout: true,
    autoIndent: 'keep',
    showFoldingControls: 'always',
    showDeprecated: true,
    definitionLinkOpensInPeek: false,
  })

  editorInstance.setModel({
    original: originalModel,
    modified: modifiedModel,
  })
}

onMounted(() => {
  initEditor()
})
</script>

<template>
  <div ref="editorDomRef" class="diff-editor" :style="{ height: `${props.height || 150}px` }" />
</template>

<style lang="scss" scoped>
.diff-editor {
  width: 100%;
  min-height: 600px;
}
</style>

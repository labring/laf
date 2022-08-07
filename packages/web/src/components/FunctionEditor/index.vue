<script lang="ts" setup>
import { debounce } from 'lodash'
import * as monaco from 'monaco-editor'
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution'

import { AutoImportTypings } from './types/index'

const props = defineProps({
  modelValue: {
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

const emit = defineEmits(['input', 'update:modelValue'])

let editorInstance: monaco.editor.IStandaloneCodeEditor
const dom = ref()

// compiler options
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.ES2016,
  allowNonTsExtensions: true,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  module: monaco.languages.typescript.ModuleKind.CommonJS,
  noEmit: true,
  allowJs: false, // 此选项为 true 会影响 main 函数的类型推导
  // typeRoots: ['node_modules/@types']
})

const autoImportTypings = new AutoImportTypings()

/**
 * 当代码变化时，尝试解析是否有新 import 的依赖，并加载其类型文件
 */
const parseImports = debounce(autoImportTypings.parse, 2000, { leading: true }).bind(autoImportTypings)

function initEditor() {
  const filename = `${props.name}=${Date.now()}.ts`
  editorInstance = monaco.editor.create(dom.value, {
    lineNumbers: 'on',
    roundedSelection: true,
    scrollBeyondLastLine: false,
    theme: props.dark ? 'vs-dark' : 'vs',
    readOnly: false,
    formatOnType: true,
    fontSize: 12,
    linkedEditing: true,
    cursorBlinking: 'expand',
    smoothScrolling: true,
    renderWhitespace: 'selection',
    tabSize: 2,
    automaticLayout: true,
    autoIndent: 'keep',
    showFoldingControls: 'always',
    showDeprecated: true,
    definitionLinkOpensInPeek: false,
    model: monaco.editor.createModel(props.modelValue || '', 'typescript', monaco.Uri.parse(filename)),
  })

  editorInstance.onDidChangeModelContent((e) => {
    const value = editorInstance?.getValue()
    emit('input', value)
    emit('update:modelValue', value)
    parseImports(getValue() || '')
  })

  // setTimeout(() => parseImports(getValue()), 0)
  parseImports(getValue())
}

function getValue() {
  return editorInstance?.getValue()
}

onMounted(() => {
  initEditor()
})
</script>

<template>
  <div ref="dom" class="editor" />
</template>

<style lang="scss" scoped>
.editor {
  height: 100%;
  width: 100%;
}
</style>

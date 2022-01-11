<template>
  <div class="json-editor">
    <div ref="jseditor" class="editor" :style="{minHeight: `${minHeight}px`}" />
  </div>
</template>

<script>
import * as monaco from 'monaco-editor'
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution'

import { AutoImportTypings } from './types/index'
import _ from 'lodash'

// compiler options
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.ES2016,
  allowNonTsExtensions: true,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  module: monaco.languages.typescript.ModuleKind.CommonJS,
  noEmit: true,
  allowJs: false // 此选项为 true 会影响 main 函数的类型推导
  // typeRoots: ['node_modules/@types']
})

const autoImportTypings = new AutoImportTypings()

export default {
  name: 'FunctionEditor',
  /* eslint-disable vue/require-prop-types */
  // props: ['value', 'height', 'dark', 'name'],
  props: {
    value: {
      type: String,
      default: ''
    },
    height: {
      type: Number,
      default: 300
    },
    dark: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      default: () => {
        return `index-${Date.now()}.ts`
      }
    }
  },
  data() {
    return {
      editor: {}
    }
  },
  computed: {
    minHeight() {
      return this.height || 150
    }
  },
  watch: {
    value(value) {
      const editorValue = this.editor?.getValue()
      if (value !== editorValue) {
        this.editor.setValue(this.value)
      }
    },
    height(value) {
      // this.initEditor()
    }
  },
  mounted() {
    this.initEditor()

    // 加载必要的类型文件
    autoImportTypings.loadDefaults()
  },
  beforeDestroy() {
    const filename = `${this.name}.ts`
    this.editor.getModel(monaco.Uri.parse(filename)).dispose()
  },
  methods: {
    initEditor() {
      const filename = `${this.name}=${Date.now()}.ts`
      this.editor = monaco.editor.create(this.$refs.jseditor, {
        lineNumbers: 'on',
        roundedSelection: true,
        scrollBeyondLastLine: false,
        theme: this.dark ? 'vs-dark' : 'vs',
        readOnly: false,
        formatOnType: true,
        fontSize: 16,
        linkedEditing: true,
        cursorBlinking: 'expand',
        smoothScrolling: true,
        renderWhitespace: 'selection',
        tabSize: 2,
        automaticLayout: true,
        autoIndent: true,
        showFoldingControls: 'always',
        showDeprecated: true,
        definitionLinkOpensInPeek: false,
        model: monaco.editor.createModel(this.value, 'typescript', monaco.Uri.parse(filename))
      })

      this.editor.onDidChangeModelContent(e => {
        const value = this.editor?.getValue()
        this.$emit('input', value)
        this.$emit('change', value)
        this.parseImports(this.getValue() || '')
      })

      // setTimeout(() => this.parseImports(this.getValue()), 0)
      this.parseImports(this.getValue())
    },

    getValue() {
      return this.editor?.getValue()
    },
    /**
     * 当代码变化时，尝试解析是否有新 import 的依赖，并加载其类型文件
     */
    parseImports: _.debounce(autoImportTypings.parse, 2000, { leading: true }).bind(autoImportTypings)
  }
}
</script>

<style lang="scss" scoped>
.json-editor {
  height: 100%;
  position: relative;

.editor {
  width: 100%;
  min-height: 600px;
}
}
</style>

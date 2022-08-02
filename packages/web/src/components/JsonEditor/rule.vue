<template>
  <div class="json-editor">
    <div ref="jsonEditor" class="editor" :style="{minHeight: `${minHeight}px`}" />
  </div>
</template>

<script>
import * as monaco from 'monaco-editor'
import { rules_schemas } from '@/components/JsonEditor/schemas'
// configure the JSON language support with schemas and schema associations
monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
  validate: true,
  schemas: rules_schemas
})
export default {
  name: 'RuleJsonEditor',
  /* eslint-disable vue/require-prop-types */
  props: ['value', 'lineNumbers', 'mode', 'dark', 'height', 'fontsize'],
  data() {
    return {
      editor: false
    }
  },
  computed: {
    minHeight() {
      return this.height || 150
    }
  },
  watch: {
    value(value) {
      const editorValue = this.editor.getValue()
      if (value !== editorValue) {
        this.editor.setValue(JSON.stringify(this.value, null, 2))
      }
    }
  },
  mounted() {
    this.editor = monaco.editor.create(this.$refs.jsonEditor, {
      value: '',
      language: 'json',
      fontSize: this.fontsize ?? 20,
      lineNumbers: this.lineNumbers ? 'on' : 'off',
      roundedSelection: true,
      scrollBeyondLastLine: false,
      readOnly: false,
      theme: this.dark ? 'vs-dark' : 'vs',
      lineHeight: 30,
      fontWeight: 'bold',
      cursorBlinking: 'expand',
      smoothScrolling: true,
      renderWhitespace: 'selection'
    })

    this.editor.onDidChangeModelContent((e) => {
      this.$emit('input', this.editor.getValue())
      this.$emit('changed', this.editor.getValue())
    })

    this.editor.setValue(JSON.stringify(this.value, null, 2))
  },
  methods: {
    getValue() {
      return this.editor.getValue()
    }
  }
}
</script>

<style lang="scss" scoped>
.json-editor {
  width: 100%;
  height: 100%;
  position: relative;
  .editor {
    width: 100%;
  }
}
</style>

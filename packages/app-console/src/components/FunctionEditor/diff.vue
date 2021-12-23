<template>
  <div class="json-editor">
    <div ref="diffeditor" class="diff-editor" :style="{height: `${minHeight}px`}" />
  </div>
</template>

<script>
import * as monaco from 'monaco-editor'

export default {
  name: 'FunctionDiffEditor',
  /* eslint-disable vue/require-prop-types */
  props: ['original', 'modified', 'height', 'dark', 'name'],
  data() {
    return {
      originalModel: null,
      modifiedModel: null,
      editor: {}
    }
  },
  computed: {
    minHeight() {
      return this.height || 150
    }
  },
  watch: {
    // modified(value) {
    //   const editorValue = this.modifiedModel?.getValue()
    //   if (value !== editorValue) {
    //     console.log(value, editorValue)
    //     this.modifiedModel.setValue(this.value)
    //   }
    // },
    height(value) {
      // this.initEditor()
    }
  },
  mounted() {
    this.initEditor()
  },
  methods: {
    initEditor() {
      this.originalModel = monaco.editor.createModel(this.original, 'typescript', monaco.Uri.parse(`diff-${Math.random()}.ts`))
      this.modifiedModel = monaco.editor.createModel(this.modified, 'typescript', monaco.Uri.parse(`diff-${Math.random()}.ts`))

      this.editor = monaco.editor.createDiffEditor(this.$refs.diffeditor, {
        enableSplitViewResizing: false,
        lineNumbers: 'on',
        roundedSelection: true,
        scrollBeyondLastLine: false,
        theme: this.dark ? 'vs-dark' : 'vs',
        readOnly: true,
        formatOnType: true,
        fontSize: 12,
        linkedEditing: true,
        cursorBlinking: 'expand',
        smoothScrolling: true,
        renderWhitespace: 'selection',
        tabSize: 2,
        automaticLayout: true,
        autoIndent: true,
        showFoldingControls: 'always',
        showDeprecated: true,
        definitionLinkOpensInPeek: false
      })

      this.editor.setModel({
        original: this.originalModel,
        modified: this.modifiedModel
      })

      // this.editor = monaco.editor.create(this.$refs.jseditor, {
      //   lineNumbers: 'on',
      //   roundedSelection: true,
      //   scrollBeyondLastLine: false,
      //   theme: this.dark ? 'vs-dark' : 'vs',
      //   readOnly: false,
      //   formatOnType: true,
      //   fontSize: 16,
      //   linkedEditing: true,
      //   cursorBlinking: 'expand',
      //   smoothScrolling: true,
      //   renderWhitespace: 'selection',
      //   tabSize: 2,
      //   automaticLayout: true,
      //   autoIndent: true,
      //   showFoldingControls: 'always',
      //   showDeprecated: true,
      //   definitionLinkOpensInPeek: false,
      //   model: monaco.editor.createModel(this.value, 'typescript', monaco.Uri.parse(filename))
      // })

      // this.editor.onDidChangeModelContent(e => {
      //   this.$emit('input', this.editor?.getValue())
      //   this.parseImports(this.getValue())
      // })
    }

    // getValue() {
    //   return this.editor?.getValue()
    // },
  }
}
</script>

<style lang="scss" scoped>
.json-editor {
  height: 100%;
  // position: relative;

.diff-editor {
  width: 100%;
  min-height: 600px;
}
}
</style>

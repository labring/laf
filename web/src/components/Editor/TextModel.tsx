import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
// @ts-ignore
import { StandaloneCodeEditorService } from "monaco-editor/esm/vs/editor/standalone/browser/standaloneCodeEditorService.js";

StandaloneCodeEditorService.prototype.findModel = function (
  editor: monaco.editor.IStandaloneCodeEditor,
  resource: monaco.Uri,
) {
  var model = null;
  if (resource !== null) model = monaco.editor.getModel(resource);
  console.log("model", model);
  if (model === null) {
    model = editor.getModel();
  }
  return model;
};

StandaloneCodeEditorService.prototype.doOpenEditor = function (
  editor: monaco.editor.IStandaloneCodeEditor,
  input: any,
) {
  let model = this.findModel(editor, input.resource);
  if (!model) {
    return null;
  }

  console.log(editor, input, model.uri.toString());
  // 阻止打开.d.ts文件
  if (model.uri.toString().includes(".d.ts")) {
    return editor;
  }
  editor.setModel(model);
  // todo
  // window.location

  let selection = input.options ? input.options.selection : null;
  if (selection) {
    if (typeof selection.endLineNumber === "number" && typeof selection.endColumn === "number") {
      editor.setSelection(selection);
      editor.revealRangeInCenter(selection, 1 /* Immediate */);
    } else {
      var pos = {
        lineNumber: selection.startLineNumber,
        column: selection.startColumn,
      };
      editor.setPosition(pos);
      editor.revealPositionInCenter(pos, 1 /* Immediate */);
    }
  }
  return editor;
};

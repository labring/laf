import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
// @ts-ignore
import { StandaloneCodeEditorService } from "monaco-editor/esm/vs/editor/standalone/browser/standaloneCodeEditorService.js";

import useFunctionStore from "@/pages/app/functions/store";
import useGlobalStore from "@/pages/globalStore";

StandaloneCodeEditorService.prototype.findModel = function (
  editor: monaco.editor.IStandaloneCodeEditor,
  resource: monaco.Uri,
) {
  var model = null;
  if (resource !== null) model = monaco.editor.getModel(resource);
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

  editor.setModel(model);

  const functionName = model.uri.path.match(/\/functions\/(.*?)\.ts$/)[1];
  const allFunctionList = useFunctionStore.getState().allFunctionList;
  const recentFunctionList = useFunctionStore.getState().recentFunctionList;
  const currentFunction = allFunctionList.find((item) => item.name === functionName);

  let newRecentFunctionList = [];

  if (recentFunctionList.find((item) => item.name === functionName)) {
    newRecentFunctionList = recentFunctionList;
  } else {
    newRecentFunctionList = [...recentFunctionList, currentFunction!];
  }

  useFunctionStore.setState({
    recentFunctionList: newRecentFunctionList as any,
    currentFunction: currentFunction,
  });

  const newUrl = `${window.location.origin}/app/${
    useGlobalStore.getState().currentApp.appid
  }/function/${functionName}`;
  window.history.replaceState({}, "", newUrl);

  let selection = input.options ? input.options.selection : null;
  if (selection) {
    if (typeof selection.endLineNumber === "number" && typeof selection.endColumn === "number") {
      editor.setSelection(selection);
      editor.revealRangeInCenter(selection, 1);
    } else {
      const pos = {
        lineNumber: selection.startLineNumber,
        column: selection.startColumn,
      };
      editor.setPosition(pos);
      editor.revealPositionInCenter(pos, 1);
    }
  }
  return editor;
};

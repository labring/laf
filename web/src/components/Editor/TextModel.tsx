// @ts-ignore
// import { ImmortalReference } from "monaco-editor/esm/vs/base/common/lifecycle";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
// @ts-ignore
import { StandaloneCodeEditorService } from "monaco-editor/esm/vs/editor/standalone/browser/standaloneCodeEditorService.js";
// import { TextModelResolverService } from "vscode/vscode/src/vs/workbench/services/textmodelResolver/common/textModelResolverService.js";

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
  if (model.uri.toString().includes(".d.ts")) {
    return editor;
  }
  // if (model.uri.toString().includes(".jsw.d.ts")) {
  //   model = this.findModel(
  //     editor,
  //     model.uri.toString().replace(".jsw.d.ts", ".jsw.ts")
  //   );
  // }

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

// export class TextModelService {
//   readonly _serviceBrand = undefined;

//   async createModelReference(resource: monaco.Uri) {
//     const model = await this.getModel(resource);
//     return new ImmortalReference({ textEditorModel: model });
//   }

//   /**
//    * Registers a specific `scheme` content provider.
//    */
//   registerTextModelContentProvider(_scheme: string, _provider: any) {
//     return { dispose: function () {} };
//   }

//   /**
//    * Check if the given resource can be resolved to a text model.
//    */
//   canHandleResource(_resource: monaco.Uri): boolean {
//     return true;
//   }

//   handleJSW(uri: monaco.Uri, jswContent: string): void {
//     let uriStr = uri.toString();
//     if (uriStr.includes(".jsw.ts")) {
//       uriStr = uriStr.replace(".jsw.ts", ".jsw.d.ts");
//       const dtsModel = monaco.editor.getModel(monaco.Uri.parse(uriStr));
//       if (!dtsModel) {
//         //@ts-ignore
//         monaco.editor.createModel(
//           jswContent,
//           undefined,
//           monaco.Uri.parse(uriStr)
//         );
//       } else {
//         //@ts-ignore
//         dtsModel.setValue(jswContent);
//       }
//     }
//   }

//   async getModel(uri: monaco.Uri): Promise<monaco.editor.ITextModel> {
//     var model = monaco.editor.getModel(uri);
//     if (!model) {
//       console.log(model)
//       const modelContent = ""
//       this.handleJSW(uri, modelContent);
//       return monaco.editor.createModel(modelContent, "typescript", uri);
//     }
//     this.handleJSW(uri, model.getValue());
//     return model;
//   }
// }

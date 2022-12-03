import React, { useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

import { globalDefinition } from "./globalDefinition";

export default function FunctionEditor(props: { value: string }) {
  const { value } = props;
  const monaco = useMonaco();

  monaco?.editor.defineTheme("lafEditorTheme", {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {
      "editorLineNumber.foreground": "#aaa",
      "editorOverviewRuler.border": "#fff",
      "editor.lineHighlightBackground": "#F5F6F8",
      "scrollbarSlider.background": "#E8EAEC",
      "editorIndentGuide.activeBackground": "#ddd",
      "editorIndentGuide.background": "#eee",
    },
  });

  useEffect(() => {
    setTimeout(() => {
      // extra libraries
      var libSource = globalDefinition;
      var libUri = "ts:filename/global.d.ts";
      monaco?.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);
      // When resolving definitions and references, the editor will try to use created models.
      // Creating a model for the library allows "peek definition/references" commands to work with the library.
      monaco?.editor.createModel(libSource, "typescript", monaco.Uri.parse(libUri));

      monaco?.editor.setTheme("lafEditorTheme");
    }, 16);
  }, [monaco]);

  return (
    <Editor
      options={{
        automaticLayout: true,
        minimap: {
          enabled: false,
        },
        scrollbar: {
          verticalScrollbarSize: 6,
        },
        lineNumbersMinChars: 4,
        fontSize: "14px",
        // fontFamily: "monospace",
        scrollBeyondLastLine: false,
      }}
      height="100%"
      defaultLanguage="typescript"
      value={value}
    />
  );
}

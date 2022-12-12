import React from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

import { globalDefinition } from "./globalDefinition";

export default function FunctionEditor(props: {
  value: string;
  path: string;
  onChange: (value: string | undefined) => void;
}) {
  const { value } = props;
  const monaco = useMonaco();

  function handleEditorWillMount(monaco: any) {
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

    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    const libSource = globalDefinition;
    const libUri = "ts:filename/global.d.ts";
    monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);

    if (!monaco.editor.getModels().length) {
      monaco.editor.createModel(libSource, "typescript", monaco.Uri.parse(libUri));
    }
  }

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
        fontSize: 16,
        // fontFamily: "monospace",
        scrollBeyondLastLine: false,
      }}
      height="100%"
      defaultLanguage="typescript"
      beforeMount={handleEditorWillMount}
      path={props.path}
      onMount={(editor, monaco) => {
        monaco.editor.setTheme("lafEditorTheme");
      }}
      value={value}
      onChange={(value, event) => {
        props.onChange && props.onChange(value);
      }}
    />
  );
}

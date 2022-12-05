import React from "react";
import Editor from "@monaco-editor/react";

export default function JsonEditor(props: { value: string | object; height?: string }) {
  const { value } = props;

  function handleEditorWillMount(monaco: any) {
    monaco?.editor.defineTheme("jsonEditorTheme", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editorLineNumber.foreground": "#aaa",
        "editorOverviewRuler.border": "#fff",
        "editor.lineHighlightBackground": "#fff",
        "scrollbarSlider.background": "#E8EAEC",
        "editorIndentGuide.activeBackground": "#ddd",
        "editorIndentGuide.background": "#eee",
      },
    });
  }

  return (
    <Editor
      defaultLanguage="json"
      value={JSON.stringify(value, null, 2)}
      height={props.height || "100%"}
      onMount={(editor, monaco) => {
        monaco.editor.setTheme("jsonEditorTheme");
      }}
      beforeMount={handleEditorWillMount}
      options={{
        lineNumber: false,
        guides: {
          indentation: false,
        },
        minimap: {
          enabled: false,
        },
        lineHighlightBackground: "red",
        scrollbar: {
          verticalScrollbarSize: 0,
          alwaysConsumeMouseWheel: false,
        },
        lineNumbers: "off",
        lineNumbersMinChars: 0,
        fontSize: 14,
        scrollBeyondLastLine: false,
        folding: false,
        overviewRulerBorder: false,
        tabSize: 2, // tab 缩进长度
      }}
    />
  );
}

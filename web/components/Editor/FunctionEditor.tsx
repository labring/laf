import React, { useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

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
    },
  });

  useEffect(() => {
    setTimeout(() => {
      monaco?.editor.setTheme("lafEditorTheme");
    }, 0);
  }, [monaco]);

  return (
    <Editor
      options={{
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
      defaultLanguage="javascript"
      value={value}
    />
  );
}

import React, { useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

export default function JsonEditor(props: { value: string | object }) {
  const { value } = props;
  const monaco = useMonaco();

  monaco?.editor.defineTheme("lafJsonEditorTheme", {
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
      monaco?.editor.setTheme("lafJsonEditorTheme");
    }, 0);
  }, [monaco]);

  return (
    <Editor
      language="json"
      value={JSON.stringify(value, null, 2)}
      width={"600"}
      height="100%"
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

import React from "react";
import Editor from "@monaco-editor/react";

export default function JsonEditor(props: { value: string | object }) {
  const { value } = props;

  return (
    <Editor
      defaultLanguage="json"
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

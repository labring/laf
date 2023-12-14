import Editor from "@monaco-editor/react";
import { LineNumbersType } from "vscode/vscode/vs/editor/common/config/editorOptions";

import { COLOR_MODE } from "@/constants";

function JSONEditor(props: {
  value: string;
  height?: string;
  colorMode?: string;
  onChange?: (value: string | undefined) => void;
}) {
  const { value, onChange, height = "90%", colorMode = COLOR_MODE.light } = props;

  const options = {
    lineNumbers: "off" as LineNumbersType,
    guides: {
      indentation: false,
    },
    automaticLayout: true,
    minimap: {
      enabled: false,
    },
    scrollbar: {
      verticalScrollbarSize: 4,
      horizontalScrollbarSize: 8,
      alwaysConsumeMouseWheel: false,
    },
    lineNumbersMinChars: 0,
    fontSize: 12,
    scrollBeyondLastLine: false,
    folding: false,
    overviewRulerBorder: false,
    tabSize: 2,
  };

  return (
    <Editor
      height={height}
      defaultLanguage="json"
      value={value}
      options={options}
      onChange={onChange}
      theme={colorMode === COLOR_MODE.dark ? "JSONEditorThemeDark" : "JSONEditorTheme"}
      beforeMount={(monaco) => {
        monaco?.editor.defineTheme("JSONEditorTheme", {
          base: "vs",
          inherit: true,
          rules: [],
          colors: {
            "editor.background": "#ffffff00",
            "editorLineNumber.foreground": "#aaa",
            "editorOverviewRuler.border": "#ffffff00",
            "editor.lineHighlightBackground": "#F7F8FA",
            "scrollbarSlider.background": "#E8EAEC",
            "editorIndentGuide.activeBackground": "#ddd",
            "editorIndentGuide.background": "#eee",
          },
        });

        monaco?.editor.defineTheme("JSONEditorThemeDark", {
          base: "vs-dark",
          inherit: true,
          rules: [],
          colors: {
            "editor.foreground": "#ffffff",
            "editor.background": "#202631",
          },
        });
      }}
    />
  );
}

export default JSONEditor;

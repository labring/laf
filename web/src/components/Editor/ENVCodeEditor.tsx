import Editor from "@monaco-editor/react";
import { LineNumbersType } from "vscode/vscode/vs/editor/common/config/editorOptions";

import { COLOR_MODE } from "@/constants";

const languageId = "dotenv";

function ENVCodeEditor(props: {
  value: string;
  height?: string;
  colorMode?: string;
  onChange?: (value: string | undefined) => void;
}) {
  const { value, onChange, height = "100%", colorMode = COLOR_MODE.light } = props;

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
    fontSize: 13,
    scrollBeyondLastLine: false,
    folding: false,
    overviewRulerBorder: false,
    tabSize: 2,
  };

  return (
    <Editor
      height={height}
      value={value}
      options={options}
      onChange={onChange}
      language={languageId}
      theme={colorMode === COLOR_MODE.dark ? "dotenvDarkTheme" : "dotenvTheme"}
      beforeMount={(monaco) => {
        monaco.languages.register({
          id: languageId,
        });

        monaco.languages.setMonarchTokensProvider(languageId, {
          tokenizer: {
            root: [
              [/^\w+(?==)/, "key"],
              [/(=)([^=]*)$/, ["operator", "value"]],
              [/^#.*/, "comment"],
              // new lines
              [/.*/, "value"],
            ],
          },
        });

        monaco.editor.defineTheme("dotenvTheme", {
          base: "vs",
          inherit: true,
          colors: {
            "editor.background": "#ffffff00",
            "editorLineNumber.foreground": "#aaa",
            "editorOverviewRuler.border": "#ffffff00",
            "editor.lineHighlightBackground": "#F7F8FA",
            "scrollbarSlider.background": "#E8EAEC",
            "editorIndentGuide.activeBackground": "#ddd",
            "editorIndentGuide.background": "#eee",
          },
          rules: [
            { token: "key", foreground: "953800" },
            { token: "value", foreground: "2E4C7E" },
            { token: "operator", foreground: "CF212E" },
            { token: "comment", foreground: "0A3069" },
          ],
        });

        monaco?.editor.defineTheme("dotenvDarkTheme", {
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

export default ENVCodeEditor;

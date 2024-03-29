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
      defaultLanguage={languageId}
      theme={colorMode === COLOR_MODE.dark ? "vs-dark" : "vs"}
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
      }}
    />
  );
}

export default ENVCodeEditor;

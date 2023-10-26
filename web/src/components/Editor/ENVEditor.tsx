import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import { COLOR_MODE } from "@/constants";

const languageId = "dotenv";

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

function ENVEditor(props: {
  value: string;
  height?: string;
  style?: any;
  colorMode?: string;
  onChange?: (value: string | undefined) => void;
}) {
  const { value, style = {}, onChange, height = "95%", colorMode = COLOR_MODE.light } = props;

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>();
  const subscriptionRef = useRef<monaco.IDisposable | undefined>(undefined);
  const monacoEl = useRef(null);

  useEffect(() => {
    if (monacoEl && !editorRef.current) {
      editorRef.current = monaco.editor.create(monacoEl.current!, {
        language: languageId,
        theme: "dotenvTheme",
        lineNumbers: "off",
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
        lineHeight: 22,
        scrollBeyondLastLine: false,
        folding: false,
        overviewRulerBorder: false,
        tabSize: 2, // tab 缩进长度
      });
    }

    return () => {};
  }, [colorMode, value]);

  // onChange
  useEffect(() => {
    subscriptionRef.current?.dispose();

    if (onChange) {
      subscriptionRef.current = editorRef.current?.onDidChangeModelContent((event) => {
        onChange(editorRef.current?.getValue());
      });
    }
  }, [onChange]);

  useEffect(() => {
    if (monacoEl && editorRef.current && value !== editorRef.current?.getValue()) {
      editorRef.current?.getModel()?.setValue(value);
      editorRef.current?.layout();
    }
  }, [value]);

  useEffect(() => {
    if (monacoEl && editorRef.current) {
      editorRef.current.updateOptions({
        theme: colorMode === COLOR_MODE.dark ? "dotenvTheme" : "dotenvTheme",
      });
    }
  }, [colorMode]);

  return (
    <div
      style={{ height: height, width: "99%", padding: "12px 2px", ...style }}
      ref={monacoEl}
    ></div>
  );
}

export default ENVEditor;

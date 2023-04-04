import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import "./userWorker";

monaco?.editor.defineTheme("JsonEditorTheme", {
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

monaco?.editor.defineTheme("JsonEditorThemeDark", {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: {
    "editor.foreground": "#ffffff",
    "editor.background": "#202631",
  },
});

function JsonEditor(props: {
  value: string;
  height?: string;
  colorMode?: string;
  onChange?: (value: string | undefined) => void;
}) {
  const { value, onChange, height = "95%", colorMode = "light" } = props;

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>();
  const subscriptionRef = useRef<monaco.IDisposable | undefined>(undefined);
  const monacoEl = useRef(null);

  useEffect(() => {
    if (monacoEl && !editorRef.current) {
      editorRef.current = monaco.editor.create(monacoEl.current!, {
        lineNumbers: "off",
        guides: {
          indentation: false,
        },
        automaticLayout: true,
        minimap: {
          enabled: false,
        },
        scrollbar: {
          verticalScrollbarSize: 0,
          alwaysConsumeMouseWheel: false,
        },
        lineNumbersMinChars: 0,
        fontSize: 13,
        scrollBeyondLastLine: false,
        folding: false,
        overviewRulerBorder: false,
        theme: colorMode === "dark" ? "JsonEditorThemeDark" : "JsonEditorTheme",
        tabSize: 2, // tab 缩进长度
        model: monaco.editor.createModel(value, "json"),
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
    }
  }, [value]);

  useEffect(() => {
    if (monacoEl && editorRef.current) {
      editorRef.current.updateOptions({
        theme: colorMode === "dark" ? "JsonEditorThemeDark" : "JsonEditorTheme",
      });
    }
  }, [colorMode]);

  return <div style={{ height: height, width: "100%", padding: "12px 2px" }} ref={monacoEl}></div>;
}

export default JsonEditor;

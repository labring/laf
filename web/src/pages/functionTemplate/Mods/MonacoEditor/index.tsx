import React, { useEffect, useRef } from "react";
import clsx from "clsx";
// import * as monaco from "monaco-editor";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import { COLOR_MODE } from "@/constants";

import "@/components/Editor/userWorker";

monaco?.editor.defineTheme("lafEditorTheme", {
  base: "vs",
  inherit: true,
  rules: [
    {
      foreground: "#0066ff",
      token: "keyword",
    },
  ],
  colors: {
    "editorLineNumber.foreground": "#aaa",
    "editorOverviewRuler.border": "#fff",
    "editor.lineHighlightBackground": "#F7F8FA",
    "scrollbarSlider.background": "#E8EAEC",
    "editorIndentGuide.activeBackground": "#fff",
    "editorIndentGuide.background": "#eee",
  },
});

monaco?.editor.defineTheme("lafEditorThemeDark", {
  base: "vs-dark",
  inherit: true,
  rules: [
    {
      foreground: "65737e",
      token: "punctuation.definition.comment",
    },
  ],
  colors: {
    // https://github.com/microsoft/monaco-editor/discussions/3838
    "editor.foreground": "#ffffff",
    "editor.background": "#202631",
    "editorIndentGuide.activeBackground": "#fff",
    "editorIndentGuide.background": "#eee",
    "editor.selectionBackground": "#101621",
    "menu.selectionBackground": "#101621",
    "dropdown.background": "#1a202c",
    "dropdown.foreground": "#f0f0f0",
    "dropdown.border": "#fff",
    "quickInputList.focusBackground": "#1a202c",
    "editorWidget.background": "#1a202c",
    "editorWidget.foreground": "#f0f0f0",
    "editorWidget.border": "#1a202c",
    "input.background": "#1a202c",
    "list.hoverBackground": "#2a303c",
  },
});

const updateModel = (value: string, editorRef: any) => {
  const newModel = monaco.editor.createModel(value, "typescript");
  if (editorRef.current?.getModel() !== newModel) {
    editorRef.current?.setModel(newModel);
  }
};

const MonacoEditor = (props: {
  value: string;
  title?: string;
  readOnly?: boolean;
  colorMode?: string;
  onChange?: (value: string | undefined) => void;
}) => {
  const { readOnly, value, title, colorMode, onChange } = props;
  // const parseImports = debounce(autoImportTypings.parse, 1500).bind(autoImportTypings);
  const monacoEl = useRef(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>();
  const subscriptionRef = useRef<monaco.IDisposable | undefined>(undefined);

  useEffect(() => {
    if (monacoEl && !editorRef.current) {
      editorRef.current = monaco.editor.create(monacoEl.current!, {
        value: value,
        minimap: {
          enabled: false,
        },
        language: "typescript",
        readOnly: readOnly,
        automaticLayout: true,
        scrollbar: {
          verticalScrollbarSize: 4,
          horizontalScrollbarSize: 8,
        },
        formatOnPaste: true,
        overviewRulerLanes: 0,
        lineNumbersMinChars: 4,
        fontSize: 14,
        scrollBeyondLastLine: false,
        theme: colorMode === COLOR_MODE.dark ? "vs-dark" : "lafEditorTheme",
      });
    }

    updateModel(value, editorRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    subscriptionRef.current?.dispose();
    if (onChange) {
      subscriptionRef.current = editorRef.current?.onDidChangeModelContent(() => {
        onChange(editorRef.current?.getValue());
        // parseImports(editorRef.current?.getValue() || "");
      });
    }
  }, [onChange]);

  useEffect(() => {
    if (monacoEl && editorRef.current) {
      editorRef.current.updateOptions({
        theme: colorMode === COLOR_MODE.dark ? "lafEditorThemeDark" : "lafEditorTheme",
      });
    }
  }, [colorMode]);

  return (
    <div
      className={clsx(
        "h-full overflow-hidden rounded-md border-2",
        colorMode === COLOR_MODE.dark ? "bg-[#202631]" : "bg-white",
      )}
    >
      <span
        className={clsx(
          "flex h-8 w-full items-center rounded-t-md px-6 text-lg font-semibold",
          colorMode === COLOR_MODE.dark ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800",
        )}
        placeholder="Function Name"
        style={{ outline: "none", boxShadow: "none" }}
      >
        {title}
      </span>
      <div ref={monacoEl} className="mb-2 rounded pt-1" style={{ width: "100%", height: "90%" }} />
    </div>
  );
};

export default MonacoEditor;

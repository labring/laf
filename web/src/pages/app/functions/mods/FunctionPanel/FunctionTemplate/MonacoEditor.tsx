import React, { useEffect, useRef } from "react";
import clsx from "clsx";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import { COLOR_MODE } from "@/constants";

// import * as monaco from "monaco-editor";
import "../../../../../../components/Editor/userWorker";

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

const MonacoEditor = (props: {
  value: string;
  title?: string;
  readOnly?: boolean;
  colorMode?: string;
}) => {
  const { readOnly, value, title, colorMode } = props;

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      const editor = monaco.editor.create(editorRef.current, {
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
        theme: colorMode === COLOR_MODE.dark ? "lafEditorThemeDark" : "lafEditorTheme",
      });

      return () => {
        editor.dispose();
      };
    }
  }, []);

  return (
    <div
      className={clsx(
        "h-full rounded-md border-2",
        colorMode === COLOR_MODE.dark ? "bg-[#202631]" : "bg-white",
      )}
    >
      <input
        className={clsx(
          "mb-2 flex h-8 w-full items-center rounded-t-md px-6 text-lg font-semibold",
          colorMode === COLOR_MODE.dark ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800",
        )}
        placeholder="Function Name"
        value={title}
        style={{ outline: "none", boxShadow: "none" }}
      />
      <div ref={editorRef} className="mb-2" style={{ width: "100%", height: "80%" }} />
    </div>
  );
};

export default MonacoEditor;

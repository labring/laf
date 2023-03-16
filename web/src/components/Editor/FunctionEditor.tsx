import { useEffect, useRef } from "react";
import { debounce } from "lodash";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import "./userWorker";

import { AutoImportTypings } from "./typesResolve";

const autoImportTypings = new AutoImportTypings();
const parseImports = debounce(autoImportTypings.parse, 1500).bind(autoImportTypings);

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.ESNext,
  allowNonTsExtensions: true,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  module: monaco.languages.typescript.ModuleKind.CommonJS,
  /**
   * This option is required to enable the synthetic default imports.
   * Support for `import dayjs from 'dayjs'` instead of `import * as dayjs from 'dayjs'`.
   * This only affects the editor, not the actual compilation.
   */
  allowSyntheticDefaultImports: true,
  noEmit: true,
  allowJs: false,
  sourceMap: true,
  noImplicitAny: false,
});

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
    "editor.foreground": "#ffffff",
    "editor.background": "#202631",
  },
});

const updateModel = (path: string, value: string, editorRef: any) => {
  const newModel =
    monaco.editor.getModel(monaco.Uri.parse(path)) ||
    monaco.editor.createModel(value, "typescript", monaco.Uri.parse(path));

  if (editorRef.current?.getModel() !== newModel) {
    editorRef.current?.setModel(newModel);
    autoImportTypings.parse(editorRef.current?.getValue() || "");
  }
};

function FunctionEditor(props: {
  value: string;
  className?: string;
  onChange: (value: string | undefined) => void;
  path: string;
  height?: string;
  colorMode?: string;
}) {
  const { value, onChange, path, height = "100%", className, colorMode = "light" } = props;
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>();
  const subscriptionRef = useRef<monaco.IDisposable | undefined>(undefined);
  const monacoEl = useRef(null);

  useEffect(() => {
    if (monacoEl && !editorRef.current) {
      editorRef.current = monaco.editor.create(monacoEl.current!, {
        minimap: {
          enabled: false,
        },
        language: "typescript",
        automaticLayout: true,
        scrollbar: {
          verticalScrollbarSize: 6,
        },
        overviewRulerLanes: 0,
        lineNumbersMinChars: 4,
        fontSize: 14,
        theme: colorMode === "dark" ? "lafEditorThemeDark" : "lafEditorTheme",
        scrollBeyondLastLine: false,
      });

      updateModel(path, value, editorRef);

      setTimeout(() => {
        autoImportTypings.loadDefaults();
      }, 10);
    }

    return () => {};
  }, [colorMode, path, value]);

  useEffect(() => {
    if (monacoEl && editorRef.current) {
      updateModel(path, value, editorRef);
    }
  }, [path, value]);

  useEffect(() => {
    if (monacoEl && editorRef.current) {
      editorRef.current.updateOptions({
        theme: colorMode === "dark" ? "lafEditorThemeDark" : "lafEditorTheme",
      });
    }
  }, [colorMode]);

  // onChange
  useEffect(() => {
    subscriptionRef.current?.dispose();
    if (onChange) {
      subscriptionRef.current = editorRef.current?.onDidChangeModelContent((event) => {
        onChange(editorRef.current?.getValue());
        parseImports(editorRef.current?.getValue() || "");
      });
    }
  }, [onChange]);

  return <div style={{ height: height }} className={className} ref={monacoEl}></div>;
}

export default FunctionEditor;

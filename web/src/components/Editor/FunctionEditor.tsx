import { useEffect, useRef } from "react";
import { debounce } from "lodash";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import "./userWorker";

import { AutoImportTypings } from "./typesResolve";

const autoImportTypings = new AutoImportTypings();
const parseImports = debounce(autoImportTypings.parse, 1500).bind(autoImportTypings);

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.ES2016,
  allowNonTsExtensions: true,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  module: monaco.languages.typescript.ModuleKind.CommonJS,
  noEmit: true,
  allowJs: false,
  // typeRoots: ['node_modules/@types']
});

monaco?.editor.defineTheme("lafEditorTheme", {
  base: "vs",
  inherit: true,
  rules: [],
  colors: {
    "editorLineNumber.foreground": "#aaa",
    "editorOverviewRuler.border": "#fff",
    "editor.lineHighlightBackground": "#F7F8FA",
    "scrollbarSlider.background": "#E8EAEC",
    "editorIndentGuide.activeBackground": "#fff",
    "editorIndentGuide.background": "#eee",
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
}) {
  const { value, onChange, path, height = "100%", className } = props;

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>();
  const subscriptionRef = useRef<monaco.IDisposable | undefined>(undefined);
  const monacoEl = useRef(null);

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

  useEffect(() => {
    if (monacoEl && editorRef.current) {
      updateModel(path, value, editorRef);
    }
  }, [path, value]);

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
        theme: "lafEditorTheme",
        scrollBeyondLastLine: false,
      });

      updateModel(path, value, editorRef);

      setTimeout(() => {
        autoImportTypings.loadDefaults();
      }, 10);
    }

    return () => {};
  }, [path, value]);

  return <div style={{ height: height }} className={className} ref={monacoEl}></div>;
}

export default FunctionEditor;

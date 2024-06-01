import { useEffect, useRef } from "react";
import { useState } from "react";
import { useCompletionFeature } from "react-monaco-copilot";
import { Spinner } from "@chakra-ui/react";
import { Editor, Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import { AutoImportTypings } from "@/components/Editor/typesResolve";
import { COLOR_MODE, RUNTIMES_PATH } from "@/constants";

import "./useWorker";

import useFunctionCache from "@/hooks/useFunctionCache";
import useFunctionStore from "@/pages/app/functions/store";
import useCustomSettingStore from "@/pages/customSetting";
import useSiteSettingStore from "@/pages/siteSetting";

const autoImportTypings = new AutoImportTypings();

export default function TSEditor(props: {
  value: string;
  path: string;
  fontSize: number;
  colorMode?: string;
  onChange: (value: string | undefined) => void;
}) {
  const { value, path, fontSize, onChange, colorMode } = props;

  const [isEditorMounted, setIsEditorMounted] = useState(false);

  const functionCache = useFunctionCache();
  const { currentFunction, allFunctionList } = useFunctionStore((state) => state);
  const { commonSettings } = useCustomSettingStore();
  const { siteSettings } = useSiteSettingStore();

  const aiCompleteUrl = siteSettings.ai_complete_url?.value;

  const monacoRef = useRef<Monaco>();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const loadModelsRef = useRef(loadModels);
  const completionFeature = useCompletionFeature({
    monaco: monacoRef.current,
    editor: editorRef.current,
    apiUrl: aiCompleteUrl || "",
  });

  loadModelsRef.current = loadModels;

  function loadModels(monaco: Monaco) {
    allFunctionList.forEach((item: any) => {
      const uri = monaco.Uri.file(`${RUNTIMES_PATH}/${item.name}.ts`);
      if (!monaco.editor.getModel(uri)) {
        monaco.editor.createModel(
          functionCache.getCache(item._id, item.source?.code),
          "typescript",
          uri,
        );
      }
    });
  }

  function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) {
    monacoRef.current = monaco;
    editorRef.current = editor;
    if (commonSettings.useCopilot && aiCompleteUrl) {
      completionFeature.onMounted();
    }
    setTimeout(() => {
      loadModelsRef.current(monacoRef.current!);
      autoImportTypings.loadDefaults(monacoRef.current);
    }, 10);

    setIsEditorMounted(true);
  }

  useEffect(() => {
    if (isEditorMounted && monacoRef.current) {
      loadModelsRef.current(monacoRef.current!);
    }
  }, [allFunctionList, isEditorMounted]);

  useEffect(() => {
    if (isEditorMounted) {
      const pos = JSON.parse(functionCache.getPositionCache(path) || "{}");
      if (pos.lineNumber && pos.column) {
        editorRef.current?.setPosition(pos);
        editorRef.current?.revealPositionInCenter(pos);
      }

      if (monacoRef.current) {
        autoImportTypings.parse(value, monacoRef.current);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, isEditorMounted]);

  const options = {
    minimap: {
      enabled: false,
    },
    language: "typescript",
    automaticLayout: true,
    scrollbar: {
      verticalScrollbarSize: 4,
      horizontalScrollbarSize: 8,
    },
    formatOnPaste: true,
    overviewRulerLanes: 0,
    lineNumbersMinChars: 4,
    fontSize: fontSize,
    scrollBeyondLastLine: false,
  };

  return (
    <Editor
      height={"100%"}
      value={value}
      path={`file://${path}`}
      options={options}
      theme={colorMode === COLOR_MODE.dark ? "vs-dark" : "light"}
      onChange={(value) => {
        onChange(value);
        functionCache.setPositionCache(
          currentFunction!.name,
          JSON.stringify(editorRef.current?.getPosition()),
        );
      }}
      loading={
        <div>
          <Spinner />
        </div>
      }
      beforeMount={(monaco) => {
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: true,
          noSyntaxValidation: false,
        });

        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ESNext,
          allowNonTsExtensions: true,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.CommonJS,
          allowSyntheticDefaultImports: true,
          noEmit: true,
          allowJs: false,
          sourceMap: true,
          noImplicitAny: false,
        });

        monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
      }}
      onMount={handleEditorDidMount}
      onValidate={() => {
        autoImportTypings.parse(value, monacoRef.current);
      }}
    />
  );
}

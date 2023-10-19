import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { debounce } from "lodash";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { buildWorkerDefinition } from "monaco-editor-workers";
import {
  RegisteredFileSystemProvider,
  RegisteredMemoryFile,
  registerFileSystemOverlay,
} from "vscode/service-override/files";

import { COLOR_MODE, Pages } from "@/constants";

import "./userWorker";
import "./theme";

import { createUrl, createWebSocketAndStartClient } from "./LanguageClient";
import { AutoImportTypings } from "./typesResolve";

import useHotKey, { DEFAULT_SHORTCUTS } from "@/hooks/useHotKey";
import useFunctionStore from "@/pages/app/functions/store";
import useGlobalStore from "@/pages/globalStore";

buildWorkerDefinition(
  "../../../../node_modules/monaco-editor-workers/dist/workers/",
  new URL("", window.location.href).href,
  false,
);

const autoImportTypings = new AutoImportTypings();
const parseImports = debounce(autoImportTypings.parse.bind(autoImportTypings), 1500);
const updateModel = (path: string, value: string, editorRef: any) => {
  const newModel =
    monaco.editor.getModel(monaco.Uri.file(path)) ||
    monaco.editor.createModel(value, "typescript", monaco.Uri.file(path));

  if (editorRef.current?.getModel() !== newModel) {
    editorRef.current?.setModel(newModel);
  }
  console.log(value);
  autoImportTypings.parse(editorRef.current?.getValue() || "");
};

function FunctionEditor(props: {
  value: string;
  className?: string;
  style?: CSSProperties;
  onChange?: (value: string | undefined) => void;
  path: string;
  height?: string;
  colorMode?: string;
  readOnly?: boolean;
  fontSize?: number;
}) {
  const {
    value,
    onChange,
    path,
    height = "100%",
    className,
    style = {},
    colorMode = COLOR_MODE.light,
    readOnly = false,
    fontSize = 14,
  } = props;

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>();
  const subscriptionRef = useRef<monaco.IDisposable | undefined>(undefined);
  const monacoEl = useRef(null);
  const hostname = "scm3dt.100.66.76.85.nip.io";
  const path1 = "/_/lsp";
  const port = 80;
  const url = useMemo(() => createUrl(hostname, port, path1), [hostname, port, path1]);
  // let lspWebSocket: WebSocket;
  const globalStore = useGlobalStore((state) => state);
  const { allFunctionList } = useFunctionStore((state) => state);

  const [fileSystemProvider] = useState<RegisteredFileSystemProvider>(() => {
    const provider = new RegisteredFileSystemProvider(false);
    registerFileSystemOverlay(1, provider);
    return provider;
  });

  useHotKey(
    DEFAULT_SHORTCUTS.send_request,
    () => {
      // format
      editorRef.current?.trigger("keyboard", "editor.action.formatDocument", {});
    },
    {
      enabled: globalStore.currentPageId === Pages.function,
    },
  );

  useEffect(() => {
    if (monacoEl && !editorRef.current) {
      const start = async () => {
        editorRef.current = monaco.editor.create(monacoEl.current!, {
          minimap: {
            enabled: false,
          },
          readOnly: readOnly,
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
          theme: "lafEditorTheme",
          scrollBeyondLastLine: false,
        });
        updateModel(path, value, editorRef);
        setTimeout(() => {
          autoImportTypings.loadDefaults();
        });

        // lspWebSocket = createWebSocketAndStartClient(url);
        createWebSocketAndStartClient(url);
      };
      start();
    } else if (monacoEl && editorRef.current) {
      updateModel(path, value, editorRef);
    }

    allFunctionList.forEach(async (item: any) => {
      if (
        !monaco.editor.getModel(
          monaco.Uri.file(`/root/laf/runtimes/nodejs/functions/${item.name}.ts`),
        )
      ) {
        fileSystemProvider.registerFile(
          new RegisteredMemoryFile(
            monaco.Uri.file(`/root/laf/runtimes/nodejs/functions/${item.name}.ts`),
            item.source.code,
          ),
        );
        monaco.editor.createModel(
          item.source.code,
          "typescript",
          monaco.Uri.file(`/root/laf/runtimes/nodejs/functions/${item.name}.ts`),
        );
        // editorRef.current?.setModel(model);
      }
    });

    // window.onbeforeunload = () => {
    //   // On page reload/exit, close web socket connection
    //   lspWebSocket?.close();
    // };
    // return () => {
    //     // On component unmount, close web socket connection
    //     lspWebSocket?.close();
    // };

    return () => {};
  }, [colorMode, path, readOnly, value, fontSize, url, allFunctionList]);

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
      editorRef.current.updateOptions({
        fontSize: fontSize,
        theme: "lafEditorTheme",
      });
    }
  }, [colorMode, fontSize]);

  return <div style={{ height: height, ...style }} className={className} ref={monacoEl}></div>;
}

export default FunctionEditor;

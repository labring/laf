import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import {
  RegisteredFileSystemProvider,
  RegisteredMemoryFile,
  registerFileSystemOverlay,
} from "vscode/service-override/files";
import { Position } from "vscode/vscode/src/vs/editor/common/core/position";

import { COLOR_MODE, Pages, RUNTIMES_PATH } from "@/constants";

import { createUrl, createWebSocketAndStartClient } from "./LanguageClient";

import "./theme/index.css";

import { TFunctionNode } from "@/apis/typing";
import useFunctionCache from "@/hooks/useFunctionCache";
import useHotKey, { DEFAULT_SHORTCUTS } from "@/hooks/useHotKey";
import useFunctionStore from "@/pages/app/functions/store";
import useGlobalStore from "@/pages/globalStore";

export const fileSystemProvider = new RegisteredFileSystemProvider(false);
registerFileSystemOverlay(1, fileSystemProvider);
const updateModel = (path: string, editorRef: any) => {
  const newModel = monaco.editor.getModel(monaco.Uri.file(path));

  if (editorRef.current?.getModel() !== newModel) {
    editorRef.current?.setModel(newModel);
  }
};

function FunctionEditor(props: {
  className?: string;
  style?: CSSProperties;
  onChange?: (code: string | undefined, pos: Position | undefined) => void;
  path: string;
  height?: string;
  colorMode?: string;
  readOnly?: boolean;
  fontSize?: number;
}) {
  const {
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
  const globalStore = useGlobalStore((state) => state);
  const { allFunctionList, setLSPStatus } = useFunctionStore(
    (state) => state,
  );
  const functionCache = useFunctionCache();
  const [functionList, setFunctionList] = useState(allFunctionList);
  const baseUrl = globalStore.currentApp.host;
  const url = useMemo(() => createUrl(baseUrl, "/_/lsp"), [baseUrl]);

  useHotKey(
    DEFAULT_SHORTCUTS.send_request,
    () => {
      editorRef.current?.trigger("keyboard", "editor.action.formatDocument", {});
    },
    {
      enabled: globalStore.currentPageId === Pages.function,
    },
  );

  useEffect(() => {
    const lspWebSocket = createWebSocketAndStartClient(url, globalStore.currentApp.develop_token);
    setLSPStatus("initializing");

    lspWebSocket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.method === "textDocument/publishDiagnostics") {
        setLSPStatus("ready");
        return;
      }
    });

    lspWebSocket.addEventListener("error", (error) => {
      console.log("error", error);
      setLSPStatus("error");
      lspWebSocket?.close();
    });

    window.onbeforeunload = () => {
      // On page reload/exit, close web socket connection
      lspWebSocket?.close();
      setLSPStatus("closed");
    };
    return () => {
      // On component unmount, close web socket connection
      lspWebSocket?.close();
      setLSPStatus("closed");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const listener = (event: any) => {
      if (event?.reason?.message?.includes("Unable to resolve nonexistent file")) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", listener);
    return () => {
      window.removeEventListener("unhandledrejection", listener);
    };
  }, []);

  useEffect(() => {
    if (monacoEl && !editorRef.current) {
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
        theme: colorMode === COLOR_MODE.dark ? "lafEditorDarkTheme" : "lafEditorTheme",
        fontFamily: "Fira Code",
        fontWeight: "450",
        scrollBeyondLastLine: false,
      });
    }

    allFunctionList.forEach((item: any) => {
      const uri = monaco.Uri.file(`${RUNTIMES_PATH}/${item.name}.ts`);

      if (functionList.includes(item)) {
        if (!monaco.editor.getModel(uri)) {
          fileSystemProvider.registerFile(new RegisteredMemoryFile(uri, item.source.code));
          monaco.editor.createModel(
            functionCache.getCache(item._id, item.source?.code),
            "typescript",
            uri,
          );
        }
      }
    });

    functionList.forEach((item: TFunctionNode) => {
      const uri = monaco.Uri.file(`${RUNTIMES_PATH}/${item.name}.ts`);

      if (!allFunctionList.includes(item)) {
        monaco.editor.getModel(uri)?.dispose();
      }
    });

    setFunctionList(allFunctionList);
    updateModel(path, editorRef);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allFunctionList, path]);

  // onChange
  useEffect(() => {
    subscriptionRef.current?.dispose();
    if (onChange) {
      subscriptionRef.current = editorRef.current?.onDidChangeModelContent((event) => {
        onChange(editorRef.current?.getValue(), editorRef.current?.getPosition() || undefined);
      });
    }
  }, [onChange]);

  useEffect(() => {
    updateModel(path, editorRef);
    const pos = JSON.parse(functionCache.getPositionCache(path) || "{}");
    if (pos.lineNumber && pos.column) {
      editorRef.current?.setPosition(pos);
      editorRef.current?.revealPositionInCenter(pos);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  useEffect(() => {
    if (monacoEl && editorRef.current) {
      editorRef.current.updateOptions({
        fontSize: fontSize,
        theme: colorMode === COLOR_MODE.dark ? "lafEditorDarkTheme" : "lafEditorTheme",
      });
    }
  }, [colorMode, fontSize]);

  return <div style={{ height: height, ...style }} className={className} ref={monacoEl}></div>;
}

export default FunctionEditor;

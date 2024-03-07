import { useEffect, useMemo, useRef, useState } from "react";
import { useCompletionFeature } from "react-monaco-copilot";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import {
  RegisteredFileSystemProvider,
  RegisteredMemoryFile,
  registerFileSystemOverlay,
} from "vscode/service-override/files";

import { APP_STATUS, COLOR_MODE, RUNTIMES_PATH } from "@/constants";

import "./useWorker";

import { createUrl, createWebSocketAndStartClient, performInit } from "./LanguageClient";

import { TFunction } from "@/apis/typing";
import useFunctionCache from "@/hooks/useFunctionCache";
import useFunctionStore from "@/pages/app/functions/store";
import useCustomSettingStore from "@/pages/customSetting";
import useGlobalStore from "@/pages/globalStore";
import useSiteSettingStore from "@/pages/siteSetting";

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
  onChange?: (code: string | undefined, pos: any) => void;
  path: string;
  colorMode?: string;
  fontSize?: number;
  value?: string;
}) {
  const { onChange, path, className, colorMode = COLOR_MODE.light, fontSize = 14, value } = props;

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const subscriptionRef = useRef<monaco.IDisposable | undefined>(undefined);
  const monacoEl = useRef(null);
  const globalStore = useGlobalStore((state) => state);
  const { allFunctionList, setLSPStatus, LSPStatus } = useFunctionStore((state) => state);
  const { commonSettings } = useCustomSettingStore();
  const { siteSettings } = useSiteSettingStore();

  const functionCache = useFunctionCache();
  const [functionList, setFunctionList] = useState(allFunctionList);
  const baseUrl = globalStore.currentApp.host;
  const url = useMemo(() => {
    try {
      return createUrl(baseUrl, "/_/lsp");
    } catch {
      return "";
    }
  }, [baseUrl]);

  const aiCompleteUrl = siteSettings.ai_complete_url?.value;
  const completionFeature = useCompletionFeature({
    monaco: monaco,
    editor: editorRef.current,
    apiUrl: aiCompleteUrl || "",
  });

  useEffect(() => {
    const startLSP = () => {
      const lspWebSocket = createWebSocketAndStartClient(url, globalStore.currentApp.develop_token);
      setLSPStatus("initializing");

      const abortController = new AbortController();

      lspWebSocket.addEventListener(
        "message",
        (event) => {
          const message = JSON.parse(event.data);
          if (message.method === "textDocument/publishDiagnostics") {
            setLSPStatus("ready");
            return;
          }
        },
        abortController,
      );

      lspWebSocket.addEventListener(
        "close",
        () => {
          setLSPStatus("closed");
        },
        abortController,
      );

      lspWebSocket.addEventListener(
        "error",
        () => {
          setLSPStatus("error");
          lspWebSocket?.close();
        },
        abortController,
      );

      window.onbeforeunload = () => {
        // On page reload/exit, close web socket connection
        lspWebSocket.close();
        setLSPStatus("closed");
      };

      return () => {
        // On component unmount, close web socket connection
        abortController.abort();
        lspWebSocket.close();
        setLSPStatus("closed");
      };
    };
    if (globalStore.currentApp.state === APP_STATUS.Running && url) {
      return startLSP();
    }
  }, [globalStore.currentApp.develop_token, globalStore.currentApp.state, url]);

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
  }, [LSPStatus]);

  useEffect(() => {
    if (monacoEl && !editorRef.current) {
      performInit(true)
        .catch((e) => {
          if (e.message?.includes("already initialized")) {
            return;
          }
          throw e;
        })
        .then(() => {
          editorRef.current = monaco.editor.create(monacoEl.current!, {
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
            theme: colorMode === COLOR_MODE.dark ? "vs-dark" : "vs",
            scrollBeyondLastLine: false,
            value: value,
          });
          monaco.editor.addKeybindingRule({
            keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP,
            command: null,
          });

          if (commonSettings.useCopilot && aiCompleteUrl) {
            completionFeature.onMounted();
          }
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

    functionList.forEach((item: TFunction) => {
      const uri = monaco.Uri.file(`${RUNTIMES_PATH}/${item.name}.ts`);

      if (!allFunctionList.includes(item)) {
        monaco.editor.getModel(uri)?.dispose();
      }
    });

    setFunctionList(allFunctionList);
    updateModel(path, editorRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allFunctionList, functionList, path]);

  // onChange
  useEffect(() => {
    subscriptionRef.current?.dispose();
    if (onChange) {
      subscriptionRef.current = editorRef.current?.onDidChangeModelContent((event) => {
        onChange(editorRef.current?.getValue(), editorRef.current?.getPosition());
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
        theme: colorMode === COLOR_MODE.dark ? "vs-dark" : "vs",
      });
    }
  }, [colorMode, fontSize]);

  return <div className={className} ref={monacoEl}></div>;
}

export default FunctionEditor;

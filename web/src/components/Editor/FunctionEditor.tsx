import { CSSProperties, useEffect, useMemo, useRef } from "react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { buildWorkerDefinition } from "monaco-editor-workers";

import { COLOR_MODE, Pages } from "@/constants";

import "./userWorker";
import "./theme";

import { createUrl, createWebSocketAndStartClient } from "./LanguageClient";

import useHotKey, { DEFAULT_SHORTCUTS } from "@/hooks/useHotKey";
import useGlobalStore from "@/pages/globalStore";

buildWorkerDefinition(
  "../../../../node_modules/monaco-editor-workers/dist/workers/",
  new URL("", window.location.href).href,
  false,
);

const updateModel = (path: string, value: string, editorRef: any) => {
  const newModel =
    monaco.editor.getModel(monaco.Uri.file(path)) ||
    monaco.editor.createModel(value, "typescript", monaco.Uri.file(path));

  console.log(editorRef.current?.getModel() !== newModel);
  if (editorRef.current?.getModel() !== newModel) {
    editorRef.current?.setModel(newModel);
  }
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
  const hostname = "localhost";
  const path1 = "";
  const port = 30000;
  const url = useMemo(() => createUrl(hostname, port, path1), [hostname, port, path1]);
  // let lspWebSocket: WebSocket;
  const globalStore = useGlobalStore((state) => state);

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

        // lspWebSocket = createWebSocketAndStartClient(url);
        createWebSocketAndStartClient(url);
      };
      start();
    } else if (monacoEl && editorRef.current) {
      updateModel(path, value, editorRef);
    }

    // window.onbeforeunload = () => {
    //   // On page reload/exit, close web socket connection
    //   lspWebSocket?.close();
    // };
    // return () => {
    //     // On component unmount, close web socket connection
    //     lspWebSocket?.close();
    // };

    return () => {};
  }, [colorMode, path, readOnly, value, fontSize, url]);

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

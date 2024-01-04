import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Spinner, Tooltip } from "@chakra-ui/react";

import { createUrl, createWebSocketAndStartClient } from "@/components/Editor/LanguageClient";

import useFunctionStore from "@/pages/app/functions/store";
import useCustomSettingStore from "@/pages/customSetting";
import useGlobalStore from "@/pages/globalStore";

export default function LSPBar() {
  const { t } = useTranslation();
  const { LSPStatus, setLSPStatus, allFunctionList } = useFunctionStore();
  const { currentApp, isLSPEffective } = useGlobalStore();
  const baseUrl = currentApp.host;
  const url = useMemo(() => {
    try {
      return createUrl(baseUrl, "/_/lsp");
    } catch {
      return "";
    }
  }, [baseUrl]);
  const { commonSettings } = useCustomSettingStore();
  const [lspWebSocket, setLspWebSocket] = useState<WebSocket>();

  useEffect(() => {
    if (!commonSettings.useLSP) {
      lspWebSocket?.close();
    }
  }, [commonSettings.useLSP, lspWebSocket]);

  const handleWebSocketClick = () => {
    const newLspWebSocket = createWebSocketAndStartClient(url, currentApp.develop_token);
    setLspWebSocket(newLspWebSocket);
    setLSPStatus("initializing");

    const abortController = new AbortController();

    newLspWebSocket.addEventListener(
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

    newLspWebSocket.addEventListener(
      "close",
      () => {
        setLSPStatus("closed");
      },
      abortController,
    );

    newLspWebSocket.addEventListener(
      "error",
      () => {
        setLSPStatus("error");
        lspWebSocket?.close();
      },
      abortController,
    );

    window.onbeforeunload = () => {
      // On page reload/exit, close web socket connection
      newLspWebSocket.close();
      setLSPStatus("closed");
    };

    return () => {
      // Cleanup function for component unmount or page unload
      abortController.abort();
      newLspWebSocket.close();
      setLSPStatus("closed");
    };
  };

  return (
    <>
      {!isLSPEffective || allFunctionList.length === 0 ? null : (
        <div>
          {!commonSettings.useLSP && (
            <Tooltip label={t("LSP.EnableLanguageServer")}>
              <div className="flex items-center text-warn-600">
                <span>{t("LSP.LanguageServerNotEnable")}</span>
              </div>
            </Tooltip>
          )}
          {commonSettings.useLSP && LSPStatus === "ready" && null}
          {commonSettings.useLSP && LSPStatus === "initializing" && (
            <div className="flex items-center text-grayModern-600">
              <Spinner size="xs" className="mr-2" />
              <span>{t("LSP.InitializingLanguageServer")}</span>
            </div>
          )}
          {commonSettings.useLSP && LSPStatus === "closed" && (
            <Tooltip label={t("LSP.InitLanguageServer")}>
              <div
                className="flex cursor-pointer items-center text-warn-600"
                onClick={handleWebSocketClick}
              >
                <span>{t("LSP.LanguageServerClosed")}</span>
              </div>
            </Tooltip>
          )}
          {commonSettings.useLSP && LSPStatus === "error" && (
            <Tooltip label={t("LSP.InitLanguageServer")}>
              <div
                className="flex cursor-pointer items-center text-red-600"
                onClick={handleWebSocketClick}
              >
                <span>{t("LSP.LanguageServerError")}</span>
              </div>
            </Tooltip>
          )}
        </div>
      )}
    </>
  );
}

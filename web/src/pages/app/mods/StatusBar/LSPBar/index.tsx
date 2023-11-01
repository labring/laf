import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Spinner, Tooltip } from "@chakra-ui/react";

import { createUrl, createWebSocketAndStartClient } from "@/components/Editor/LanguageClient";

import useFunctionStore from "@/pages/app/functions/store";
import useGlobalStore from "@/pages/globalStore";
export default function LSPBar() {
  const { t } = useTranslation();
  const { LSPStatus, setLSPStatus } = useFunctionStore();
  const { currentApp } = useGlobalStore();
  const baseUrl = currentApp.host;
  const url = useMemo(() => createUrl(baseUrl, "/_/lsp"), [baseUrl]);

  return (
    <div>
      {LSPStatus === "ready" && null}
      {LSPStatus === "initializing" && (
        <div className="flex items-center text-grayModern-600">
          <Spinner size="xs" className="mr-2" />
          <span>{t("LSP.InitializingLanguageServer")}</span>
        </div>
      )}
      {LSPStatus === "closed" && (
        <div className="flex cursor-pointer items-center text-warn-600">
          <span>{t("LSP.LanguageServerClosed")}</span>
        </div>
      )}
      {LSPStatus === "error" && (
        <Tooltip label={t("LSP.InitLanguageServer")}>
          <div
            className="flex cursor-pointer items-center text-red-600"
            onClick={() => {
              createWebSocketAndStartClient(url, currentApp.develop_token);
              setLSPStatus("initializing");
            }}
          >
            <span>{t("LSP.LanguageServerError")}</span>
          </div>
        </Tooltip>
      )}
    </div>
  );
}

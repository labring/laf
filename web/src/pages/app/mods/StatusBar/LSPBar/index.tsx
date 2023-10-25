import { useMemo } from "react";
import { Spinner } from "@chakra-ui/react";

import { createUrl, createWebSocketAndStartClient } from "@/components/Editor/LanguageClient";

import useFunctionStore from "@/pages/app/functions/store";

export default function LSPBar() {
  const hostname = "scm3dt.100.66.76.85.nip.io";
  const lspPath = "/_/lsp";
  const port = 80;
  const url = useMemo(() => createUrl(hostname, port, lspPath), [hostname, port, lspPath]);

  const { LSPStatus, setLSPStatus } = useFunctionStore();

  return (
    <div>
      {LSPStatus === "ready" && (
        <div className="flex items-center text-blue-600">
          <span>LSP is Running</span>
        </div>
      )}
      {LSPStatus === "initializing" && (
        <div className="flex items-center text-grayModern-600">
          <Spinner size="xs" className="mr-2" />
          <span>Initializing TS language features…</span>
        </div>
      )}
      {LSPStatus === "closed" && (
        <div className="flex cursor-pointer items-center text-warn-600">
          <span>LSP closed</span>
        </div>
      )}
      {LSPStatus === "error" && (
        <div
          className="flex cursor-pointer items-center text-red-600"
          onClick={() => {
            createWebSocketAndStartClient(url);
            setLSPStatus("initializing");
          }}
        >
          <span>LSP ERROR</span>
        </div>
      )}
    </div>
  );
}

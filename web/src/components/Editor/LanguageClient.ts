import getConfigurationServiceOverride from "@codingame/monaco-vscode-configuration-service-override";
import getTextmateServiceOverride from "@codingame/monaco-vscode-textmate-service-override";
import getThemeServiceOverride from "@codingame/monaco-vscode-theme-service-override";
import { initServices, MonacoLanguageClient } from "monaco-languageclient";
import { Uri } from "vscode";
import { CloseAction, ErrorAction, MessageTransports } from "vscode-languageclient";
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from "vscode-ws-jsonrpc";

import { RUNTIMES_PATH } from "@/constants";

import "@codingame/monaco-vscode-typescript-basics-default-extension";
import "./TextModel";

export const createLanguageClient = (transports: MessageTransports): MonacoLanguageClient => {
  return new MonacoLanguageClient({
    name: "Laf Language Client",
    clientOptions: {
      documentSelector: ["typescript"],
      errorHandler: {
        error: () => ({ action: ErrorAction.Continue }),
        closed: () => ({ action: CloseAction.DoNotRestart }),
      },
      workspaceFolder: {
        uri: Uri.file(RUNTIMES_PATH),
        name: "Laf Workspace",
        index: 0,
      },
    },
    connectionProvider: {
      get: () => {
        return Promise.resolve(transports);
      },
    },
  });
};

export const createUrl = (
  hostname: string,
  port: number,
  path: string,
  secure: boolean = window.isSecureContext
): string => {
  const protocol = secure ? "wss" : "ws";
  const url = new URL(`${protocol}://${hostname}:${port}${path}`);
  return url.toString();
};

export const createWebSocketAndStartClient = (url: string, token: string) => {
  const webSocket = new WebSocket(url, [token]);
  webSocket.onopen = () => {
    webSocket.send(token);
    const socket = toSocket(webSocket);
    const reader = new WebSocketMessageReader(socket);
    const writer = new WebSocketMessageWriter(socket);
    const languageClient = createLanguageClient({
      reader,
      writer,
    });
    languageClient.start();
    reader.onClose(() => languageClient?.stop());
  };
  return webSocket;
};

export const performInit = async (vscodeApiInit: boolean) => {
  if (vscodeApiInit === true) {
    await initServices({
      userServices: {
        ...getThemeServiceOverride(),
        ...getTextmateServiceOverride(),
        ...getConfigurationServiceOverride(Uri.file(RUNTIMES_PATH)),
      },
      // debugLogging: true,
    });
  }
};
import getConfigurationServiceOverride from "@codingame/monaco-vscode-configuration-service-override";
// import getEditorServiceOverride from "@codingame/monaco-vscode-editor-service-override"
// import getModelServiceOverride from '@codingame/monaco-vscode-model-service-override'
import getTextmateServiceOverride from "@codingame/monaco-vscode-textmate-service-override";
// import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
import getThemeServiceOverride from "@codingame/monaco-vscode-theme-service-override";
import { editor, languages } from "monaco-editor";
import { initServices, MonacoLanguageClient } from "monaco-languageclient";
import { Uri } from "vscode";
import { createConfiguredEditor, IReference, ITextFileEditorModel } from "vscode/monaco";
// import { ITextModelService, SyncDescriptor } from "vscode/services";
import { CloseAction, ErrorAction, MessageTransports } from "vscode-languageclient";
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from "vscode-ws-jsonrpc";

import "@codingame/monaco-vscode-typescript-basics-default-extension";
import "./TextModel";

// import { TextModelService } from "./TextModel";

export const createLanguageClient = (transports: MessageTransports): MonacoLanguageClient => {
  return new MonacoLanguageClient({
    name: "Sample Language Client",
    clientOptions: {
      documentSelector: ["typescript"],
      errorHandler: {
        error: () => ({ action: ErrorAction.Continue }),
        closed: () => ({ action: CloseAction.DoNotRestart }),
      },
      workspaceFolder: {
        uri: Uri.file("/root/laf/runtimes/nodejs/functions"),
        name: "Sample Workspace",
        index: 0,
      },
    },
    // create a language client connection from the JSON RPC connection on demand
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
  secure?: boolean,
): string => {
  const protocol = secure ? "wss" : "ws";
  const url = new URL(`${protocol}://${hostname}:${port}${path}`);

  return url.toString();
};

export const createWebSocketAndStartClient = (url: string): WebSocket => {
  const webSocket = new WebSocket(url);
  webSocket.onopen = () => {
    const socket = toSocket(webSocket);
    const reader = new WebSocketMessageReader(socket);
    const writer = new WebSocketMessageWriter(socket);
    const languageClient = createLanguageClient({
      reader,
      writer,
    });
    languageClient.start();
    reader.onClose(() => languageClient.stop());
  };
  return webSocket;
};

export type ExampleJsonEditor = {
  languageId: string;
  editor: editor.IStandaloneCodeEditor;
  uri: Uri;
  modelRef: IReference<ITextFileEditorModel>;
};
export const performInit = async (vscodeApiInit: boolean) => {
  if (vscodeApiInit === true) {
    await initServices({
      userServices: {
        ...getThemeServiceOverride(),
        ...getTextmateServiceOverride(),
        ...getConfigurationServiceOverride(Uri.file("/root/laf/runtimes/nodejs/functions/")),
        // ...getEditorServiceOverride(async (modelRef, options, sideBySide) => {
        //   console.log('Received open editor call with parameters: ', modelRef, options, sideBySide);
        //   return undefined;
        // })
        // ...getKeybindingsServiceOverride()
      },
      debugLogging: true,
    });

    // register the TS language with Monaco
    languages.register({
      id: "typescript",
      extensions: [".ts", ".tsx"],
      aliases: ["typescript", "javascript"],
      mimetypes: ["text/typescript", "text/javascript"],
    });
  }
};

export const createJsonEditor = async (config: { htmlElement: HTMLElement; content: string }) => {
  // create monaco editor
  const editor = createConfiguredEditor(config.htmlElement, {
    minimap: {
      enabled: false,
    },
    readOnly: false,
    language: "typescript",
    automaticLayout: true,
    scrollbar: {
      verticalScrollbarSize: 4,
      horizontalScrollbarSize: 8,
    },
    formatOnPaste: true,
    overviewRulerLanes: 0,
    lineNumbersMinChars: 4,
    fontSize: 14,
    theme: "vs",
    scrollBeyondLastLine: false,
  });

  return Promise.resolve(editor);
};

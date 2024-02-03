import path from 'path'
import fs from 'fs'
import * as rpc from 'vscode-ws-jsonrpc-cjs'
import * as lsp from 'vscode-languageserver'
import * as server from 'vscode-ws-jsonrpc-cjs/server'
import * as ws from 'ws'
import { IncomingMessage } from 'http'
import { Duplex } from 'stream'
import { uniqueId } from 'lodash'
import { logger } from './logger'
import { parseToken } from './token'

const WORKSPACE_PATH = path.join(__dirname, '../../functions')

export class LspWebSocket {
  private static lspWS = new ws.WebSocketServer({
    noServer: true,
    perMessageDeflate: false,
  })

  static handleUpgrade(
    request: IncomingMessage,
    socket: Duplex,
    upgradeHead: Buffer,
  ) {
    // verify the debug token
    {
      const token = request.headers['sec-websocket-protocol'] as string
      if (!token) {
        request.destroy(new Error('x-laf-develop-token is needed'))
        return
      }

      const auth = parseToken(token) || null
      if (auth?.type !== 'develop') {
        request.destroy(new Error('permission denied: invalid develop token'))
        return
      }
    }

    this.lspWS.handleUpgrade(request, socket, upgradeHead, (webSocket) => {
      const socket = {
        send: (content) =>
          webSocket.send(content, (error) => {
            if (error) {
              throw error
            }
          }),
        onMessage: (cb) => webSocket.on('message', cb),
        onError: (cb) => webSocket.on('error', cb),
        onClose: (cb) => webSocket.on('close', cb),
        dispose: () => webSocket.close(),
      }

      if (webSocket.readyState === webSocket.OPEN) {
        const uid = uniqueId()
        this.launchLsp(socket, uid)
        logger.info(`Launched ts lsp server ${uid}`)
      }
    })
  }

  static launchLsp(socket: rpc.IWebSocket, uid: string) {
    if (!fs.existsSync(WORKSPACE_PATH)) {
      fs.mkdirSync(WORKSPACE_PATH)
    }

    const reader = new rpc.WebSocketMessageReader(socket)
    const writer = new rpc.WebSocketMessageWriter(socket)

    // start the language server as an external process
    const tlsPath = path.join(
      __dirname,
      '../../node_modules/typescript-language-server/lib/cli.mjs',
    )

    const socketConnection = server.createConnection(reader, writer, () =>
      socket.dispose(),
    )
    const serverConnection = server.createServerProcess(
      'typescript-language-server',
      'node',
      [
        tlsPath,
        '--stdio',
        '--log-level',
        '4',
        '--tsserver-log-verbosity',
        'off',
      ],
    )

    server.forward(
      socketConnection,
      serverConnection,
      (message: lsp.Message & { method: string }) => {
        if (
          message.method === 'window/logMessage' ||
          message.method === 'initialize'
        ) {
          return message
        }

        // @ts-ignore
        if (message?.error?.code === -32601) {
          // suppress error messages that cause lsp server to shut down
          return '' as any
        }

        if (lsp.Message.isRequest(message)) {
          if (message.method === lsp.InitializeRequest.type.method) {
            const initializeParams = message.params as lsp.InitializeParams
            initializeParams.processId = process.pid
            initializeParams.workspaceFolders = [
              {
                name: 'statics',
                uri: `file://${WORKSPACE_PATH}`,
              },
            ]
          }
        }

        if (lsp.Message.isNotification(message)) {
          if (
            message.method === lsp.DidOpenTextDocumentNotification.type.method
          ) {
            const params = message.params as lsp.DidOpenTextDocumentParams
            const [, fullPath] = params.textDocument.uri.split('//')

            if (!fullPath.includes('node_modules')) {
              // write file if not exists
              if (!fs.existsSync(fullPath)) {
                const dir = path.dirname(fullPath)
                if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir, {
                    recursive: true,
                  })
                }
                fs.writeFileSync(fullPath, params.textDocument.text)
              }
            }
          }

          if (
            message.method === lsp.DidCloseTextDocumentNotification.type.method
          ) {
            const params = message.params as lsp.DidCloseTextDocumentParams
            const [, fullPath] = params.textDocument.uri.split('//')

            if (!fullPath.includes('node_modules')) {
              // delete file if exists
              if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath)
              }

              let dir = path.dirname(fullPath)

              // remove empty dir
              if (dir.startsWith(WORKSPACE_PATH)) {
                while (dir !== WORKSPACE_PATH) {
                  if (fs.readdirSync(dir).length === 0) {
                    fs.rmdirSync(dir)
                    dir = path.dirname(dir)
                  }
                }
              }
            }
          }
        }
        return message
      },
    )

    socketConnection.onClose(() => {
      logger.info(`lsp server ${uid} closed`)
    })
  }
}

import { IncomingMessage } from 'http'
import { WebSocket, WebSocketServer } from 'ws'
import { WEBSOCKET_FUNCTION_NAME } from '../constants'
import { logger } from './logger'
import { generateUUID } from './utils'
import { FunctionModule } from './engine/module'
import { FunctionContext } from './engine'

export class WebSocketAgent {
  private static _server = null

  static get server(): WebSocketServer {
    if (!this._server) {
      this._server = new WebSocketServer({ noServer: true })
      this.server.on('connection', handleSocketConnection)
      this.server.on('error', (error) =>
        logger.error('websocket server got error:', error),
      )
    }

    return this._server
  }

  static get clients() {
    return this.server.clients
  }
}

/**
 * Handle socket connection
 * @param socket
 * @param request
 */
function handleSocketConnection(socket: WebSocket, request: IncomingMessage) {
  // handle connection event
  handleWebSocketEvent('WebSocket:connection', null, socket, request)

  // handle message event
  socket.on('message', (data, isBinary) => {
    const param = { data, isBinary }
    handleWebSocketEvent('WebSocket:message', param, socket)
  })

  // handle error event
  socket.on('error', (error) => {
    const param = error
    handleWebSocketEvent('WebSocket:error', param, socket)
  })

  // handle close event
  socket.on('close', (code, reason) => {
    const param = { code, reason }
    handleWebSocketEvent('WebSocket:close', param, socket)
  })
}

/**
 * Handle WebSocket Event
 * @param event
 * @param data
 * @param socket
 * @param request
 */
async function handleWebSocketEvent(
  event: string,
  data: any,
  socket: WebSocket,
  request?: IncomingMessage,
) {
  const param: FunctionContext = {
    params: data,
    method: event,
    requestId: generateUUID(),
    socket,
    __function_name: WEBSOCKET_FUNCTION_NAME,
    url: request?.url,
    headers: request?.headers,
  }

  const module = FunctionModule.get(WEBSOCKET_FUNCTION_NAME)
  const handler = module.default || module.main || module
  if (typeof handler === 'function') {
    await handler(param)
  } else {
    logger.error(`default function not found in ${WEBSOCKET_FUNCTION_NAME}`)
  }
}

import { IncomingMessage } from 'http'
import { WebSocket, WebSocketServer } from 'ws'
import {
  CLOUD_FUNCTION_COLLECTION,
  WEBSOCKET_FUNCTION_NAME,
} from '../constants'
import { DatabaseAgent } from '../db'
import { CloudFunction, ICloudFunctionData } from './function-engine'
import { logger } from './logger'
import { generateUUID } from './utils'

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
  const func = await getWebsocketCloudFunction()
  if (!func) {
    logger.error('WebSocket function not found')
    return 'WebSocket handler not found'
  }

  const param: any = {
    params: data,
    method: event,
    requestId: generateUUID(),
    socket,
    __function_name: func.name,
    headers: request?.headers,
  }

  const cf = new CloudFunction(func)
  await cf.invoke(param)
}

/**
 * Get websocket handler cloud function
 * @returns
 */
async function getWebsocketCloudFunction() {
  const db = DatabaseAgent.db

  const doc = await db
    .collection<ICloudFunctionData>(CLOUD_FUNCTION_COLLECTION)
    .findOne({
      name: WEBSOCKET_FUNCTION_NAME,
    })

  return doc
}

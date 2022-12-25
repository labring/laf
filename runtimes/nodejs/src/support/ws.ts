import { IncomingMessage } from 'http'
import { RawData, WebSocket, WebSocketServer } from 'ws'
import { Constants } from '../constants'
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
  // logger.debug(`socket connected`, request.headers)

  socket.on('message', (data, isBinary) => {
    handleSocketMessage(socket, data, isBinary)
  })

  socket.on('error', (err) => handleSocketError(socket, err))
  socket.on('close', (code, reason) => handleSocketClose(socket, code, reason))

  handleWebSocketEvent('WebSocket:connection', null, socket, request)
}

/**
 * Handle socket message
 * @param _socket
 * @param _data
 * @param _isBinary
 */
async function handleSocketMessage(
  socket: WebSocket,
  data: RawData,
  isBinary: boolean,
) {
  const param = { data, isBinary }
  await handleWebSocketEvent('WebSocket:message', param, socket)
}

/**
 * Handle socket close
 * @param _socket
 * @param _code
 * @param _reason
 */
function handleSocketClose(socket: WebSocket, code: number, reason: Buffer) {
  const param = { code, reason }
  handleWebSocketEvent('WebSocket:close', param, socket)
}

/**
 * Handle socket error
 * @param _socket
 * @param error
 */
function handleSocketError(socket: WebSocket, error: Error) {
  logger.error('websocket got err', error)

  const param = error
  handleWebSocketEvent('WebSocket:error', param, socket)
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
  const funcs = await getWebsocketCloudFunctions()

  for (const func of funcs) {
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
}

/**
 * Get cloud functions with websocket on
 * @returns
 */
async function getWebsocketCloudFunctions() {
  const db = DatabaseAgent.db

  const docs = await db
    .collection<ICloudFunctionData>(Constants.function_collection)
    .find({
      websocket: true,
    })
    .toArray()

  return docs
}

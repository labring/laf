import { IncomingMessage } from 'http'
import { RawData, WebSocket, WebSocketServer } from 'ws'
import { logger } from './logger'
import { SchedulerInstance } from './scheduler'


export class WebSocketAgent {
  private static _server = null

  static get server(): WebSocketServer {
    if (!this._server) {
      this._server = new WebSocketServer({ noServer: true })
      this.server.on('connection', handleSocketConnection)
      this.server.on('error', error => logger.error('websocket server got error:', error))
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
  logger.debug(`socket connected`, request.headers)

  socket.on('message', (data, isBinary) => {
    handleSocketMessage(socket, data, isBinary)
  })

  socket.on('error', err => handleSocketError(socket, err))
  socket.on('close', (code, reason) => handleSocketClose(socket, code, reason))

  SchedulerInstance.websocketEmit('WebSocket:connection', null, socket, request)
}

/**
 * Handle socket message
 * @param _socket 
 * @param _data 
 * @param _isBinary 
 */
async function handleSocketMessage(socket: WebSocket, data: RawData, isBinary: boolean) {
  const param = { data, isBinary }
  SchedulerInstance.websocketEmit('WebSocket:message', param, socket)
}

/**
 * Handle socket close
 * @param _socket 
 * @param _code 
 * @param _reason 
 */
function handleSocketClose(socket: WebSocket, code: number, reason: Buffer) {
  const param = { code, reason }
  SchedulerInstance.websocketEmit('WebSocket:close', param, socket)
}

/**
 * Handle socket error
 * @param _socket 
 * @param error 
 */
function handleSocketError(socket: WebSocket, error: Error) {
  logger.error('websocket got err', error)

  const param = error
  SchedulerInstance.websocketEmit('WebSocket:error', param, socket)
}
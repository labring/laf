import { DataType, QueueType } from './index'

export type IRequestMsgType =
  | 'LOGIN' // 鉴权（环境维度）
  | 'INIT_WATCH' // 初始化监听
  | 'REBUILD_WATCH' // 重建监听，1）数据失序时 2）checkLast 不一致时
  | 'CHECK_LAST' // 检查是否有未收到的消息
  | 'CLOSE_WATCH' // 取消监听
  | 'PING' // 心跳 ping

export type IResponseMsgType =
  | 'LOGIN_RES' // LOGIN 回包
  | 'INIT_EVENT' // INIT_WATCH 回包
  | 'NEXT_EVENT' // 服务端主动推变更事件
  | 'CHECK_EVENT' // CHECK_LAST 回包
  | 'PONG' // 心跳 PING 回包
  | 'ERROR' // 错误异常

export interface IRequestMessageBase<W extends boolean = true> {
  watchId: W extends true ? string : undefined
  requestId: string
  msgType: IRequestMsgType
  msgData: IRequestMessageMsgData
}

export type IRequestMessageMsgData =
  | IRequestMessageInitWatchData
  | IRequestMessageLoginData
  | IRequestMessageRebuildWatchData
  | IRequestMessageCheckLastData
  | IRequestMessageCloseWatchData
  | IRequestMessagePingData

export type IRequestMessage =
  | IRequestMessageInitWatchMsg
  | IRequestMessageLoginMsg
  | IRequestMessageRebuildWatchMsg
  | IRequestMessageCheckLastMsg
  | IRequestMessageCloseWatchMsg
  | IRequestMessagePingMsg

export interface IRequestMessageLoginData {
  envId: string
  // signStr: string
  // secretVersion: number
  accessToken: string
  referrer: 'web'
  sdkVersion: string
  dataVersion: string
}

export interface IRequestExtraMessageLoginData {
  runtime: string
  signStr: string
  secretVersion: string
}
export interface IRequestMessageLoginMsg extends IRequestMessageBase<false> {
  msgType: 'LOGIN'
  msgData: IRequestMessageLoginData
  exMsgData?: IRequestExtraMessageLoginData
}

export interface IRequestMessageInitWatchData {
  envId: string
  collName: string // collection name
  query: string // query that is stringified
  limit?: number
  orderBy?: Record<string, string>
}

export interface IRequestMessageInitWatchMsg extends IRequestMessageBase {
  msgType: 'INIT_WATCH'
  msgData: IRequestMessageInitWatchData
}

export interface IRequestMessageRebuildWatchData {
  envId: string
  collName: string
  queryID: string
  eventID: number
}

export interface IRequestMessageRebuildWatchMsg extends IRequestMessageBase {
  msgType: 'REBUILD_WATCH'
  msgData: IRequestMessageRebuildWatchData
}

export interface IRequestMessageCheckLastData {
  queryID: string
  eventID: number
}

export interface IRequestMessageCheckLastMsg extends IRequestMessageBase {
  msgType: 'CHECK_LAST'
  msgData: IRequestMessageCheckLastData
}

export type IRequestMessageCloseWatchData = null

export interface IRequestMessageCloseWatchMsg extends IRequestMessageBase {
  msgType: 'CLOSE_WATCH'
  msgData: IRequestMessageCloseWatchData
}

export type IRequestMessagePingData = null

export interface IRequestMessagePingMsg extends IRequestMessageBase<false> {
  msgType: 'PING'
  msgData: IRequestMessagePingData
}

// export interface IResponseMessageBase {

export interface IResponseMessageBase<W extends boolean = true> {
  watchId: W extends true ? string : undefined
  // watchId: string
  requestId: string
  msgType: IResponseMsgType
  msgData: IResponseMessageMsgData
}

export type IResponseMessageMsgData =
  | IResponseMessageLoginResData
  | IResponseMessageInitEventData
  | IResponseMessageNextEventData
  | IResponseMessageCheckEventData
  | IResponseMessagePongData
  | IResponseMessageErrorData

export type IResponseMessage =
  | IResponseMessageLoginResMsg
  | IResponseMessageInitEventMsg
  | IResponseMessageNextEventMsg
  | IResponseMessageCheckEventMsg
  | IResponseMessagePongMsg
  | IResponseMessageErrorMsg

export type IResponseMessageLoginResData = {
  envId: string
} & Partial<IResponseMessageErrorData>

export interface IResponseMessageLoginResMsg
  extends IResponseMessageBase<false> {
  msgType: 'LOGIN_RES'
  msgData: IResponseMessageLoginResData
}

export interface IResponseMessageInitEventData {
  queryID: string
  currEvent: number
  events: IDBEvent[]
}

export interface IResponseMessageInitEventMsg extends IResponseMessageBase {
  msgType: 'INIT_EVENT'
  msgData: IResponseMessageInitEventData
}

export interface IResponseMessageNextEventData {
  queryID: string
  currEvent: number
  events: IDBEvent[]
}

export interface IResponseMessageNextEventMsg extends IResponseMessageBase {
  msgType: 'NEXT_EVENT'
  msgData: IResponseMessageNextEventData
}

export interface IResponseMessageCheckEventData {
  queryID: string
  currEvent: number
}

export interface IResponseMessageCheckEventMsg extends IResponseMessageBase {
  msgType: 'CHECK_EVENT'
  msgData: IResponseMessageCheckEventData
}

export type IResponseMessagePongData = null

export interface IResponseMessagePongMsg extends IResponseMessageBase {
  msgType: 'PONG'
  msgData: IResponseMessagePongData
}

export type IResponseMessageErrorData = {
  message: string
} & (
  | { code: 'SYS_ERR' } // 服务器系统错误
  | { code: 'CHECK_LOGIN_FAILED' } // 登陆校验失败
  | { code: 'SIGN_INVALID_ERROR' } // ws签名无效
  | { code: 'SIGN_EXPIRED_ERROR' } // 签名过期
  | { code: 'INVALIID_ENV' } // 环境无效
  | { code: 'SIGN_PARAM_INVALID' } // cam签名无效
  | { code: 'COLLECTION_PERMISSION_DENIED' } // 没有集合操作权限
  | { code: 'QUERYID_INVALID_ERROR' }) // queryID 无效

export interface IResponseMessageErrorMsg extends IResponseMessageBase {
  msgType: 'ERROR'
  msgData: IResponseMessageErrorData
}

export type IDBEvent = IDBInitEvent | IDBNextEvent

export interface IDBEventBase {
  ID: number // event id
  DataType: DataType
  QueueType: QueueType
  DocID: string
  Doc: string
}

export interface IDBInitEvent extends IDBEventBase {
  DataType: 'init'
  QueueType: 'init'
  UpdatedFields?: any
  removedFields?: any
}

// <DataType, QueueType>
// * <update, update>
// * <update, enqueue>
// * <update, dequeue>
// * <add, enqueue>
// * <remove, dequeue>

// export interface IDBNextEvent extends IDBEventBase {
//   DocID: string
//   Doc: string
//   UpdatedFields?: any
//   removedFields?: any
// }

export type IDBNextEvent =
  | IDBNextEventDataUpdate
  | IDBNextEventDataReplace
  | IDBNextEventDataAdd
  | IDBNextEventDataRemove
  | IDBNextEventDataLimit

export type IDBNextEventDataUpdate =
  | IDBNextEventDataUpdateQueueUpdate
  | IDBNextEventDataUpdateQueueEnqueue
  | IDBNextEventDataUpdateQueueDequeue

export type IDBNextEventDataReplace =
  | IDBNextEventDataReplaceQueueUpdate
  | IDBNextEventDataReplaceQueueEnqueue
  | IDBNextEventDataReplaceQueueDequeue

export type IDBNextEventDataLimit = 
  | IDBNextEventDataLimitQueueEnqueue
  | IDBNextEventDataLimitQueueDequeue

export interface IDBNextEventDataUpdateQueueUpdate extends IDBEventBase {
  DataType: 'update'
  QueueType: 'update'
  Doc: ''
  UpdatedFields: string
  RemovedFields: string
}

export interface IDBNextEventDataUpdateQueueEnqueue extends IDBEventBase {
  DataType: 'update'
  QueueType: 'enqueue'
  Doc: string // full doc
  UpdatedFields: string
  RemovedFields: string
}

export interface IDBNextEventDataUpdateQueueDequeue extends IDBEventBase {
  DataType: 'update'
  QueueType: 'dequeue'
  Doc: ''
  UpdatedFields: string
  RemovedFields: string
}

export interface IDBNextEventDataReplaceQueueUpdate extends IDBEventBase {
  DataType: 'replace'
  QueueType: 'update'
  Doc: string
  UpdatedFields: ''
  RemovedFields: ''
}

export interface IDBNextEventDataReplaceQueueEnqueue extends IDBEventBase {
  DataType: 'replace'
  QueueType: 'enqueue'
  Doc: string
  UpdatedFields: ''
  RemovedFields: ''
}

export interface IDBNextEventDataReplaceQueueDequeue extends IDBEventBase {
  DataType: 'replace'
  QueueType: 'dequeue'
  Doc: string
  UpdatedFields: ''
  RemovedFields: ''
}

export interface IDBNextEventDataAdd extends IDBEventBase {
  DataType: 'add'
  QueueType: 'enqueue'
}

export interface IDBNextEventDataRemove extends IDBEventBase {
  DataType: 'remove'
  QueueType: 'dequeue'
  Doc: ''
}

export interface IDBNextEventDataLimitQueueEnqueue extends IDBEventBase {
  DataType: 'limit'
  QueueType: 'enqueue'
  Doc: string
  UpdatedFields: ''
  RemovedFields: ''
}

export interface IDBNextEventDataLimitQueueDequeue extends IDBEventBase {
  DataType: 'limit'
  QueueType: 'dequeue'
  Doc: ''
  UpdatedFields: ''
  RemovedFields: ''
}
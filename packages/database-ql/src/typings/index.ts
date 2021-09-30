/**
 * Common interfaces and types
 */

/**
 * Database Watch
 */

export type DataType = 'init' | 'update' | 'add' | 'remove' | 'replace' | 'limit'
export type QueueType = 'init' | 'enqueue' | 'dequeue' | 'update'

// TODO:
export interface IDatabaseServiceContext extends IServiceContext {
  appConfig: IAppConfig
  ws?: any
}

export interface IAppConfig {
  docSizeLimit: number
  realtimePingInterval: number
  realtimePongWaitTimeout: number
  request: any
}

export interface IWatchOptions {
  // server realtime data init & change event
  onChange: (snapshot: ISnapshot) => void
  // error while connecting / listening
  onError: (error: any) => void
}

export interface ISnapshot {
  id: number
  docChanges: ISingleDBEvent[]
  docs: Record<string, any>
  type?: SnapshotType
}

export interface ISingleDBEvent {
  id: number
  dataType: DataType
  queueType: QueueType
  docId: string
  doc: Record<string, any>
  updatedFields?: any
  removedFields?: any
}

export type SnapshotType = 'init'

export interface DBRealtimeListener {
  // "And Now His Watch Is Ended"
  close: () => void
}

export interface IRealtimeListenerConstructorOptions extends IWatchOptions {
  // ws: any
  // query: string
}

export interface IServiceContext {
  // name: string
  // identifiers: IRuntimeIdentifiers
  // debug: boolean
  env?: string
}

import { ActionType, OrderByDirection } from "./constant"

export interface ResponseStruct {
  code: number
  data: any
  error: string
  requestId: string
  [extra: string]: any
}

export interface RequestInterface {
  send(action: ActionType, data: QueryParam): Promise<ResponseStruct>
}

export interface QueryOrder {
  field: string
  direction: OrderByDirection
}

export interface ProjectionType {
  [field: string]: 0 | 1
}

export interface AggregateStage {
  stageKey: string,
  stageValue: any
}

export interface QueryParam {

  collectionName: string

  /**
   * Query options
   */
  query?: Object
  order?: QueryOrder[]
  offset?: number
  limit?: number
  projection?: ProjectionType
  count?: boolean

  /**
   * Update options
   */
  multi?: boolean
  merge?: boolean
  upsert?: boolean
  data?: any

  /**
   * Aggregate stages
   */
  stages?: AggregateStage[]
}

interface BaseResult {
  requestId?: string
  code?: string | number
  error?: string
  ok?: boolean
}

export interface GetRes<T> extends BaseResult {
  data: T[]
  total?: number
  limit?: number
  offset?: number
}

export interface GetOneRes<T> extends BaseResult {
  data: T
}

export interface UpdateRes extends BaseResult {
  updated: number
  matched: number
  upsertId: number
}

export interface AddRes extends BaseResult {
  id: string | number
  insertedCount: number
}

export interface RemoveRes extends BaseResult {
  deleted: number
}

export interface CountRes extends BaseResult {
  total: number
}

export interface CreateIndexRes extends BaseResult{
    indexName: string
}

export interface CreateIndexesRes extends BaseResult{
    indexName: string[]
}

export interface DropIndexRes extends BaseResult{ 
    result: any
}

export interface DropIndexesRes extends BaseResult{
    result: any
}

export interface ListIndexesRes extends BaseResult{ 
    list: object[]
}
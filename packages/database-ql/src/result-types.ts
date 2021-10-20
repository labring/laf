
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

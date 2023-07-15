import { ObjectId } from 'mongodb'

export interface AccountChargeOrderQuery {
  phase?: string
  id?: ObjectId
  startTime?: Date
  endTime?: Date
  page?: number
  pageSize?: number
  channel?: string
}

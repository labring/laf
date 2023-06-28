import { Request } from 'express'

export interface IRequest extends Request {
  user?: any
  requestId?: string
  [key: string]: any
}

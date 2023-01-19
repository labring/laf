import { Application, User } from '@prisma/client'
import { Request, Response } from 'express'

export interface IRequest extends Request {
  user?: User
  application?: Application
  [key: string]: any
}

export type IResponse = Response

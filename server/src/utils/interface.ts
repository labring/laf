import { Application, User } from '@prisma/client'
import { Request, Response } from 'express'

export interface IRequest extends Request {
  user?: User
  application?: Application
}

export type IResponse = Response

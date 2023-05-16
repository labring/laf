import { User } from '@prisma/client'
import { Request, Response } from 'express'
import { Application } from 'src/application/entities/application'

export interface IRequest extends Request {
  user?: User
  application?: Application
  [key: string]: any
}

export type IResponse = Response

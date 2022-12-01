import { User } from '@prisma/client'
import { Request, Response } from 'express'
import { Application } from '../core/api/application.cr'

export interface IRequest extends Request {
  user?: User
  application?: Application
}

export type IResponse = Response

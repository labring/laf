import { Request, Response } from 'express'
import { Application } from 'src/application/entities/application'
import { UserWithProfile } from 'src/user/entities/user'

export interface IRequest extends Request {
  user?: UserWithProfile
  application?: Application
  [key: string]: any
}

export interface IResponse extends Response {
  [key: string]: any
}

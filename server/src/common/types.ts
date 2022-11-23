import { User } from '@prisma/client'
import { Request } from 'express'
import { IApplication } from 'src/applications/entities/application.entity'

export interface IRequest extends Request {
  user?: User
  application?: IApplication
}

import { Application, User } from '@prisma/client'
import { Request, Response } from 'express'

export interface IRequest extends Request {
  user?: User
  application?: Application
  [key: string]: any
}

export type IResponse = Response

export interface AlismsConfig {
  accessKeyId: string
  accessKeySecret: string
  endpoint: string
  signName: string
  templateCode: string
}

export interface ServiceResponse {
  code: string
  error?: string
}

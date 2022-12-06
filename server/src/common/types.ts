import { Application, User } from '@prisma/client'
import { Request, Response } from 'express'

export interface IRequest extends Request {
  user?: User
  application?: Application
}

export type IResponse = Response

export function toQuantityString(value: number) {
  const m = Math.floor(value / 1024 / 1024)
  return `${m}Mi`
}

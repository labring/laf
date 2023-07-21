import { ObjectId } from 'mongodb'

export enum EmailVerifyCodeType {
  Bind = 'bind',
  Unbind = 'Unbind',
}

export enum EmailVerifyCodeState {
  Unused = 0,
  Used = 1,
}

export class EmailVerifyCode {
  _id?: ObjectId
  email: string
  code: string
  ip: string
  type: EmailVerifyCodeType
  state: EmailVerifyCodeState
  createdAt: Date
  updatedAt: Date
}

import { ObjectId } from 'mongodb'

export enum SmsVerifyCodeType {
  Signin = 'Signin',
  Signup = 'Signup',
  ResetPassword = 'ResetPassword',
  Bind = 'Bind',
  Unbind = 'Unbind',
  ChangePhone = 'ChangePhone',
}

export enum SmsVerifyCodeState {
  Unused = 0,
  Used = 1,
}

export class SmsVerifyCode {
  _id?: ObjectId
  phone: string
  code: string
  ip: string
  type: SmsVerifyCodeType
  state: SmsVerifyCodeState
  createdAt: Date
  updatedAt: Date
}

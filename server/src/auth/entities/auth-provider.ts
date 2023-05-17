import { ObjectId } from 'mongodb'

export enum AuthProviderState {
  Enabled = 'Enabled',
  Disabled = 'Disabled',
}

export class AuthProvider {
  _id?: ObjectId
  name: string
  bind: any
  register: boolean
  default: boolean
  state: AuthProviderState
  config: any
  createdAt: Date
  updatedAt: Date
}

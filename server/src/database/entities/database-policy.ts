import { ObjectId } from 'mongodb'

export class DatabasePolicy {
  _id?: ObjectId
  appid: string
  name: string
  injector?: string
  createdAt: Date
  updatedAt: Date

  constructor(partial: Partial<DatabasePolicy>) {
    Object.assign(this, partial)
  }
}

export class DatabasePolicyRule {
  _id?: ObjectId
  appid: string
  policyName: string
  collectionName: string
  value: any
  createdAt: Date
  updatedAt: Date

  constructor(partial: Partial<DatabasePolicyRule>) {
    Object.assign(this, partial)
  }
}

export type DatabasePolicyWithRules = DatabasePolicy & {
  rules: DatabasePolicyRule[]
}

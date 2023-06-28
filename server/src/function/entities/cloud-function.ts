import { ObjectId } from 'mongodb'

export type CloudFunctionSource = {
  code: string
  compiled: string
  uri?: string
  version: number
  hash?: string
  lang?: string
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
}

export class CloudFunction {
  _id?: ObjectId
  appid: string
  name: string
  source: CloudFunctionSource
  desc: string
  tags: string[]
  methods: HttpMethod[]
  params?: any
  createdAt: Date
  updatedAt: Date
  createdBy: ObjectId
}

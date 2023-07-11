import { ObjectId } from 'mongodb'
import { CloudFunctionSource, HttpMethod } from './cloud-function'

export class CloudFunctionRecycleBin {
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

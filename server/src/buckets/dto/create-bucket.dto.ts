import { BucketPolicy } from '../entities/bucket.entity'

export class CreateBucketDto {
  shortName: string
  appid: string
  policy: BucketPolicy
  storage: string

  get name() {
    return `${this.appid}-${this.shortName}`
  }
}

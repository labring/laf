import { ApiProperty } from '@nestjs/swagger'
import { BucketPolicy } from '../entities/bucket.entity'

export class CreateBucketDto {
  @ApiProperty({
    description: 'The short name of the bucket which not contain the appid',
  })
  shortName: string

  @ApiProperty()
  appid: string

  @ApiProperty({
    enum: BucketPolicy,
  })
  policy: BucketPolicy

  @ApiProperty({
    description: 'The storage capacity of the bucket: "1Gi", "0.5Gi", "100Gi"',
  })
  storage: string

  get name() {
    return `${this.appid}-${this.shortName}`
  }
}

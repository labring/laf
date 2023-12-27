import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export class CloudFunctionHistorySource {
  @ApiProperty()
  code: string
}

export class CloudFunctionHistory {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty()
  appid: string

  @ApiProperty({ type: String })
  functionId: ObjectId

  @ApiProperty({ type: CloudFunctionHistorySource })
  source: CloudFunctionHistorySource

  @ApiProperty({ type: String })
  changelog?: string

  @ApiProperty()
  createdAt: Date
}

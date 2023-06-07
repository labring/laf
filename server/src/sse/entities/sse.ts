import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export class SseEventSource {

  @ApiProperty({ type: String })
  _id: ObjectId

  @ApiProperty()
  uid: string

  @ApiProperty()
  appid: string

  @ApiProperty()
  eventType: string

  @ApiProperty()
  payload: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

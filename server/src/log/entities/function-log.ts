import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export class FunctionLog {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty()
  request_id: string

  // cloud function name
  @ApiProperty()
  func: string

  // log content
  @ApiProperty()
  data: string

  @ApiProperty()
  created_at: Date
}

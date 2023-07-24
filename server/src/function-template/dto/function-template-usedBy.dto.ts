import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export class GetFunctionTemplateUsedByDto {
  @ApiProperty({ type: String })
  uid: ObjectId
}

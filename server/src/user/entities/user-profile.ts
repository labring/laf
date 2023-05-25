import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export class UserProfile {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty({ type: String })
  uid: ObjectId

  @ApiPropertyOptional()
  openData?: any

  @ApiPropertyOptional()
  avatar?: string

  @ApiPropertyOptional()
  name?: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

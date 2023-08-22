import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'
class IdVerified {
  @ApiProperty({ type: Boolean })
  isVerified: boolean

  @ApiProperty({ type: Number })
  idVerifyFailedTimes: number
}

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

  @ApiProperty({ type: IdVerified })
  idVerified?: IdVerified

  @ApiProperty()
  idCard?: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

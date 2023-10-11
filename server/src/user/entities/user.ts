import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'
import { UserProfile } from './user-profile'

export class User {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty()
  username: string

  @ApiPropertyOptional()
  email?: string

  @ApiPropertyOptional()
  phone?: string

  @ApiPropertyOptional()
  github?: number

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

export class UserWithProfile extends User {
  @ApiPropertyOptional()
  profile?: UserProfile
}

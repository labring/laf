import { ApiProperty } from '@nestjs/swagger'
import { User, UserProfile } from '@prisma/client'

export class UserProfileDto implements UserProfile {
  id: string

  @ApiProperty()
  uid: string

  @ApiProperty()
  openid: string

  @ApiProperty()
  avatar: string

  @ApiProperty()
  name: string

  from: string

  @ApiProperty()
  openData: any

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

export class UserDto implements User {
  @ApiProperty()
  id: string

  @ApiProperty()
  email: string

  @ApiProperty()
  username: string

  @ApiProperty()
  phone: string

  @ApiProperty()
  profile: UserProfileDto

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

import { ApiProperty } from '@nestjs/swagger'
import { User, UserProfile } from '@prisma/client'

export class UserProfileDto implements UserProfile {
  @ApiProperty()
  uid: string

  @ApiProperty()
  openid: string

  @ApiProperty()
  avatar: string

  @ApiProperty()
  name: string

  from: string
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
}

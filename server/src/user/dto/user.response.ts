import { ApiProperty } from '@nestjs/swagger'
import { User } from '../entities/user'
import { UserProfile } from '../entities/user-profile'
import { ObjectId } from 'mongodb'

export class UserProfileDto implements UserProfile {
  _id?: ObjectId

  @ApiProperty()
  uid: ObjectId

  @ApiProperty()
  avatar: string

  @ApiProperty()
  name: string

  @ApiProperty()
  openData: any

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

export class UserDto implements User {
  @ApiProperty()
  _id?: ObjectId

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

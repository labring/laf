import { ObjectId } from 'mongodb'
import { User } from './user'
import { ApiProperty } from '@nestjs/swagger'

export class PersonalAccessToken {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty({ type: String })
  uid: ObjectId

  @ApiProperty()
  name: string

  token: string

  @ApiProperty()
  expiredAt: Date

  @ApiProperty()
  createdAt: Date
}

export class PersonalAccessTokenWithUser extends PersonalAccessToken {
  @ApiProperty({ type: User })
  user: User
}

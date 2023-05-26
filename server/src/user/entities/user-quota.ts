import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export class UserQuota {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty({ type: String })
  uid: ObjectId

  @ApiProperty()
  limitOfCPU: number

  @ApiProperty()
  limitOfMemory: number

  @ApiProperty()
  limitCountOfApplication: number

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

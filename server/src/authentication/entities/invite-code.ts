import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export enum InviteCodeState {
  Enabled = 'Active',
  Disabled = 'Inactive',
}

export class InviteCode {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty({ type: String })
  uid: ObjectId

  @ApiProperty({ type: String })
  code: string

  @ApiProperty({ enum: InviteCodeState })
  state: InviteCodeState

  @ApiProperty({ type: String })
  name?: string

  @ApiProperty({ type: String })
  description?: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

export class InviteRelation {
  _id?: ObjectId
  uid: ObjectId
  invitedBy: ObjectId
  codeId: ObjectId
  createdAt: Date
  transactionId?: ObjectId
}

import { OmitType } from '@nestjs/mapped-types'
import { GroupInviteCode } from '../entities/group-invite-code'
import { Group } from '../entities/group'
import { ApiProperty } from '@nestjs/swagger'
import { User } from 'src/user/entities/user'

export class GetGroupInviteCodeDetailDto extends OmitType(GroupInviteCode, [
  'groupId',
  '_id',
  'createdBy',
  'groupId',
]) {
  @ApiProperty({ type: Group })
  group: Group

  @ApiProperty({ type: User })
  invitedBy: User
}

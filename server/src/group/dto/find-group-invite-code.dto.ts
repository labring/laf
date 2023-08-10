import { ApiProperty } from '@nestjs/swagger'
import { User } from 'src/user/entities/user'
import { GroupInviteCode } from '../entities/group-invite-code'
import { OmitType } from '@nestjs/mapped-types'

export class FindGroupInviteCodeDto extends OmitType(GroupInviteCode, [
  'usedBy',
]) {
  @ApiProperty({ type: User })
  usedBy: User
}

import { ApiProperty } from '@nestjs/swagger'
import { User } from 'src/user/entities/user'
import { TeamInviteCode } from '../entities/team-invite-code'
import { OmitType } from '@nestjs/mapped-types'

export class FindTeamInviteCodeDto extends OmitType(TeamInviteCode, [
  'usedBy',
]) {
  @ApiProperty({ type: User })
  usedBy: User
}

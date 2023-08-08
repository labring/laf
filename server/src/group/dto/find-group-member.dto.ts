import { ApiProperty } from '@nestjs/swagger'
import { OmitType } from '@nestjs/mapped-types'
import { GroupMember } from '../entities/group-member'

export class FindGroupMemberDto extends OmitType(GroupMember, [
  'groupId',
  '_id',
]) {
  @ApiProperty()
  username: string
}

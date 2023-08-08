import { IsEnum } from 'class-validator'
import { GroupRole } from '../entities/group-member'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateGroupMemberRoleDto {
  @ApiProperty({ enum: GroupRole })
  @IsEnum(GroupRole)
  role: GroupRole
}

import { IsEnum } from 'class-validator'
import { TeamRole } from '../entities/team-member'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateTeamMemberRoleDto {
  @ApiProperty({ enum: TeamRole })
  @IsEnum(TeamRole)
  role: TeamRole
}

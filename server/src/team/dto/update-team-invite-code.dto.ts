import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty } from 'class-validator'
import { TeamRole } from '../entities/team-member'

export class GenerateTeamInviteCodeDto {
  @ApiProperty({ enum: TeamRole })
  @IsEnum(TeamRole)
  @IsNotEmpty()
  role: TeamRole
}

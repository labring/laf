import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty } from 'class-validator'

export class UpdateTeamInviteCodeDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  enable: boolean
}

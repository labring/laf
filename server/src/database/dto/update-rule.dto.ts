import { ApiProperty } from '@nestjs/swagger'
import { IsJSON, IsNotEmpty, MaxLength } from 'class-validator'

export class UpdatePolicyRuleDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(2048)
  @IsJSON()
  value: string
}

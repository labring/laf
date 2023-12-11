import { ApiProperty } from '@nestjs/swagger'
import { IsJSON, IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreatePolicyRuleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  collectionName: string

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(2048)
  @IsJSON()
  value: string
}

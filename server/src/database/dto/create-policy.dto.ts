import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreatePolicyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string
}

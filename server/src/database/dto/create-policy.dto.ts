import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreatePolicyDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string
}

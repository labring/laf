import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class Pat2TokenDto {
  @ApiProperty({
    description: 'PAT',
    example:
      'laf_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  pat: string
}

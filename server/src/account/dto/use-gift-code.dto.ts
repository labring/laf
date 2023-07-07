import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length } from 'class-validator'

export class UseGiftCodeDto {
  @ApiProperty({
    description: 'gift code',
    type: 'string',
  })
  @IsNotEmpty()
  @Length(16, 16)
  code: string
}

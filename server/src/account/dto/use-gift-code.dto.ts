import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length } from 'class-validator'

export class UseGiftCodeDto {
  @ApiProperty({
    description: 'gift code',
    type: 'string',
  })
  @IsNotEmpty()
  @Length(8, 64)
  code: string
}

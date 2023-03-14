import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length } from 'class-validator'

export class BindPhoneDto {
  @ApiProperty({
    description: 'phone number',
    example: '13805718888',
  })
  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  phone: string

  @ApiProperty({
    description: 'sms verify code',
    example: '032476',
  })
  @IsNotEmpty()
  @Length(6, 6)
  code: string
}

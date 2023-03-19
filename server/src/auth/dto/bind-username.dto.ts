import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator'

export class BindUsernameDto {
  @ApiProperty({
    description: 'username',
    example: 'laf-user',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 64)
  username: string

  @ApiProperty({
    description: 'phone',
    example: '13805718888',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/)
  phone: string

  @ApiProperty({
    description: 'sms verify code',
    example: '032476',
  })
  @IsNotEmpty()
  @Length(6, 6)
  code: string
}

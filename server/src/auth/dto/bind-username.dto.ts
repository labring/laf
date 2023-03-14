import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length } from 'class-validator'

export class BindUsernameDto {
  @ApiProperty({
    description: 'username',
    example: 'laf-user',
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 16)
  username: string

  @ApiProperty({
    description: 'phone',
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

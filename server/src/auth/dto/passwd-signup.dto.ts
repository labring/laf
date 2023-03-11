import { Optional } from '@nestjs/common'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length } from 'class-validator'

export class PasswdSignupDto {
  @ApiProperty({
    description: 'username',
    example: 'laf-user',
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 16)
  username: string

  @ApiProperty({
    description: 'password, 8-16 characters',
    example: 'laf-user-password',
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 32)
  password: string

  @ApiPropertyOptional({
    description: 'phone',
    example: '13805718888',
  })
  @IsString()
  @Length(11, 11)
  phone: string

  @ApiPropertyOptional({
    description: 'verify code',
    example: '032456',
  })
  @IsString()
  @Length(6, 6)
  code: string
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { SmsVerifyCodeType } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsString, Length, Matches } from 'class-validator'

export class PasswdSignupDto {
  @ApiProperty({
    description: 'username, 3-64 characters',
    example: 'laf-user',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 64)
  username: string

  @ApiProperty({
    description: 'password, 8-64 characters',
    example: 'laf-user-password',
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 64)
  password: string

  @ApiPropertyOptional({
    description: 'phone',
    example: '13805718888',
  })
  @IsString()
  @Matches(/^1[3-9]\d{9}$/)
  phone: string

  @ApiPropertyOptional({
    description: 'verify code',
    example: '032456',
  })
  @IsString()
  @Length(6, 6)
  code: string

  @ApiPropertyOptional({
    description: 'type',
    example: 'Signup',
  })
  @IsEnum(SmsVerifyCodeType)
  type: SmsVerifyCodeType
}

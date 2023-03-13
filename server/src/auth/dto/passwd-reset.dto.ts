import { ApiProperty } from '@nestjs/swagger'
import { SmsVerifyCodeType } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator'

export class PasswdResetDto {
  @ApiProperty({
    description: 'new password, 8-32 characters',
    example: 'laf-user-password',
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 32)
  password: string

  @ApiProperty({
    description: 'phone',
    example: '13805718888',
  })
  @IsString()
  @Length(11, 11)
  phone: string

  @ApiProperty({
    description: 'verify code',
    example: '032456',
  })
  @IsString()
  @Length(6, 6)
  code: string

  @ApiProperty({
    description: 'type',
    example: 'ResetPassword',
  })
  @IsEnum(SmsVerifyCodeType)
  type: SmsVerifyCodeType
}

import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsString, Length, Matches } from 'class-validator'
import { SmsVerifyCodeType } from '../entities/sms-verify-code'

export class PasswdResetDto {
  @ApiProperty({
    description: 'new password, 8-64 characters',
    example: 'laf-user-password',
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 64)
  password: string

  @ApiProperty({
    description: 'phone',
    example: '13805718888',
  })
  @IsString()
  @Matches(/^1[3-9]\d{9}$/)
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

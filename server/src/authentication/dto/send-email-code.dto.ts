import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator'
import { EmailVerifyCodeType } from '../entities/email-verify-code'

export class SendEmailCodeDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({
    description: 'verify code type',
    enum: EmailVerifyCodeType,
  })
  @IsNotEmpty()
  @IsEnum(EmailVerifyCodeType)
  type: EmailVerifyCodeType
}

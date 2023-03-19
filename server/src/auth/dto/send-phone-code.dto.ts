import { ApiProperty } from '@nestjs/swagger'
import { SmsVerifyCodeType } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator'

export class SendPhoneCodeDto {
  @ApiProperty({
    description: 'phone',
    example: '13805718888',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/)
  phone: string

  @ApiProperty({
    description: 'verify code type',
    example: 'Signin | Signup | ResetPassword | Bind | Unbind | ChangePhone',
  })
  @IsNotEmpty()
  @IsEnum(SmsVerifyCodeType)
  type: SmsVerifyCodeType
}

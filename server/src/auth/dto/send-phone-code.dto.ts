import { ApiProperty } from '@nestjs/swagger'
import { SmsVerifyCodeType } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator'

export class SendPhoneCodeDto {
  @ApiProperty({
    description: 'phone',
    example: '13805718888',
  })
  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  phone: string

  @ApiProperty({
    description: 'verify code type',
    example: 'Signin | Signup | ResetPassword | Bind | Unbind | ChangePhone',
  })
  @IsNotEmpty()
  @IsEnum(SmsVerifyCodeType)
  type: SmsVerifyCodeType
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator'
import { SmsVerifyCodeType } from '../entities/sms-verify-code'

export class PasswdSignupDto {
  @ApiProperty({
    description: 'username, 3-64 characters',
    example: 'laf-user',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 64)
  @Matches(/^\S+$/, { message: 'invalid characters' })
  username: string

  @ApiProperty({
    description: 'password, 8-64 characters',
    example: 'laf-user-password',
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 64)
  @Matches(/^\S+$/, { message: 'invalid characters' })
  password: string

  @ApiPropertyOptional({
    description: 'phone',
    example: '13805718888',
  })
  @IsOptional()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/)
  phone: string

  @ApiPropertyOptional({
    description: 'verify code',
    example: '032456',
  })
  @IsOptional()
  @IsString()
  @Length(6, 6)
  code: string

  @ApiPropertyOptional({
    description: 'type',
    example: 'Signup',
  })
  @IsOptional()
  @IsEnum(SmsVerifyCodeType)
  type: SmsVerifyCodeType

  @ApiPropertyOptional({
    description: 'invite code',
    example: 'iLeMi7x',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\S+$/, { message: 'invalid characters' })
  inviteCode: string
}

import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator'

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
  @IsOptional()
  @Matches(/^1[3-9]\d{9}$/)
  phone: string

  @ApiProperty({
    description: 'email',
  })
  @IsString()
  @IsEmail()
  @IsOptional()
  email: string

  @ApiProperty({
    description: 'verify code',
    example: '032456',
  })
  @IsString()
  @Length(6, 6)
  code: string
}

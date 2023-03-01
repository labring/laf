import { ApiProperty } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  IsEnum,
} from 'class-validator'

enum LoginType {
  verify_code = 'verify_code',
  password = 'password',
}

export class LoginDto {
  @ApiProperty({
    description: 'phone number',
    example: '19612345678',
  })
  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  phone: string

  @ApiProperty({
    description: 'login type',
    example: 'verify_code | password',
  })
  @IsNotEmpty()
  @IsEnum(LoginType)
  type: LoginType

  @ApiProperty({
    description: 'verify code',
    example: '789042',
  })
  @IsString()
  @Length(6, 6)
  @IsOptional()
  code?: string

  @ApiProperty({
    description: 'password',
    example: '7idn&dlk#12kidw89042',
  })
  @IsString()
  @Length(8, 32)
  @IsOptional()
  password?: string
}

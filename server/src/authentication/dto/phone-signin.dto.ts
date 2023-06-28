import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  Matches,
} from 'class-validator'

export class PhoneSigninDto {
  @ApiProperty({
    description: 'phone',
    example: '13805718888',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/)
  phone: string

  @ApiProperty({})
  @IsNotEmpty()
  @Length(6, 6)
  code: string

  @ApiProperty({
    description: 'username',
    example: 'laf-user',
  })
  @IsOptional()
  @IsString()
  @Length(3, 64)
  username: string

  @ApiProperty({
    description: 'password, 8-64 characters',
    example: 'laf-user-password',
  })
  @IsOptional()
  @IsString()
  @Length(8, 64)
  password: string

  @ApiPropertyOptional({
    description: 'invite code',
    example: 'iLeMi7x',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\S+$/, { message: 'invalid characters' })
  inviteCode: string
}

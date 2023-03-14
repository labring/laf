import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length, IsOptional } from 'class-validator'

export class PhoneSigninDto {
  @ApiProperty({
    description: 'phone',
    example: '13805718888',
  })
  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
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
  @Length(8, 16)
  username: string

  @ApiProperty({
    description: 'password, 8-32 characters',
    example: 'laf-user-password',
  })
  @IsOptional()
  @IsString()
  @Length(8, 32)
  password: string
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length } from 'class-validator'

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

  @ApiPropertyOptional({
    description: 'username',
    example: 'laf-user',
  })
  @IsString()
  @Length(8, 16)
  username: string

  @ApiPropertyOptional({
    description: 'password, 8-16 characters',
    example: 'laf-user-password',
  })
  @IsString()
  @Length(8, 32)
  password: string
}

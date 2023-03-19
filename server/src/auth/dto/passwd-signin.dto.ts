import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length } from 'class-validator'

export class PasswdSigninDto {
  @ApiProperty({
    description: 'username',
    example: 'laf-user',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 64)
  username: string

  @ApiProperty({
    description: 'password, 8-64 characters',
    example: 'laf-user-password',
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 64)
  password: string
}

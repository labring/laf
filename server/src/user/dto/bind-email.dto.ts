import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, Length } from 'class-validator'

export class BindEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'verify code',
    example: '032476',
  })
  @IsNotEmpty()
  @Length(6, 6)
  code: string
}

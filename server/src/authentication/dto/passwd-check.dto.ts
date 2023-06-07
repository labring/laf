import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length } from 'class-validator'

export class PasswdCheckDto {
  @ApiProperty({
    description: 'username | phone | email',
    example: 'laf-user | 13805718888 | laf-user@laf.com',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 64)
  username: string
}

import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length } from 'class-validator'

export class SmsLoginCodeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(11, 11)
  phone: string
}

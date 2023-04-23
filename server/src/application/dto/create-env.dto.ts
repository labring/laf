import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator'

export class CreateEnvironmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(1, 64)
  @Matches(/^[a-zA-Z_][a-zA-Z0-9_]{1,64}$/)
  name: string

  @ApiProperty()
  @Length(0, 4096)
  @IsString()
  value: string
}

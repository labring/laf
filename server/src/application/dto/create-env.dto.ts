import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length } from 'class-validator'

export class CreateEnvironmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(1, 64)
  name: string

  @ApiProperty()
  @Length(0, 4096)
  @IsString()
  value: string
}

import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length } from 'class-validator'

export class CreateDependencyDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(1, 64)
  name: string

  @ApiProperty()
  @IsNotEmpty()
  @Length(1, 64)
  spec: string
}

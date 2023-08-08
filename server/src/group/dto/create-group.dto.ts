import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length } from 'class-validator'

export class CreateGroupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 64)
  name: string
}

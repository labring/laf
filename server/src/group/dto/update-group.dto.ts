import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length } from 'class-validator'

export class UpdateGroupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 64)
  name: string
}

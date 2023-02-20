import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length } from 'class-validator'

export class DeleteDependencyDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(1, 64)
  name: string
}

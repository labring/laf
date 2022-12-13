import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length } from 'class-validator'

export class CreateCollectionDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 32)
  name: string

  async validate() {
    return null
  }
}

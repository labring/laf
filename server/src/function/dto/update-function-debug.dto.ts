import { ApiProperty } from '@nestjs/swagger'
import { IsObject } from 'class-validator'

export class UpdateFunctionDebugDto {
  @ApiProperty()
  @IsObject()
  params: any

  validate() {
    return null
  }
}

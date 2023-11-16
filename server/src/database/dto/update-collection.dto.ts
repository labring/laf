import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsObject, IsString } from 'class-validator'

export class UpdateCollectionDto {
  @ApiPropertyOptional()
  @IsObject()
  validatorSchema: object

  @ApiPropertyOptional()
  @IsString()
  validationLevel: string
}

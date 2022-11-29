import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateCollectionDto {
  @ApiPropertyOptional()
  validatorSchema: object

  @ApiPropertyOptional()
  validationLevel: string
}

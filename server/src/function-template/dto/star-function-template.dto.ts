import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { ObjectId } from 'mongodb'

export class StarFunctionTemplateDto {
  @ApiProperty({
    description: 'The ObjectId of function template',
  })
  @IsNotEmpty()
  functionTemplateId: ObjectId
}

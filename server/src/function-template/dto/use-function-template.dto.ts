import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length } from 'class-validator'
import { ObjectId } from 'mongodb'

export class UseFunctionTemplateDto {
  @ApiProperty({
    description: 'The ObjectId of function template',
    type: 'string',
  })
  @IsNotEmpty()
  @Length(24, 24)
  functionTemplateId: ObjectId

  @IsNotEmpty()
  @ApiProperty()
  appid: string
}

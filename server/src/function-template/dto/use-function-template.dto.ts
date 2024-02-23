import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length } from 'class-validator'
import { ObjectId } from 'mongodb'

export class UseFunctionTemplateDto {
  @ApiProperty({
    description: 'The ObjectId of function template',
    type: 'string',
  })
  @IsNotEmpty()
  @Length(24, 24)
  functionTemplateId: ObjectId

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  appid: string
}

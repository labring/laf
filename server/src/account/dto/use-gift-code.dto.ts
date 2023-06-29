import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length } from 'class-validator'
import { ObjectId } from 'mongodb'

export class UseGiftCodeDto {
  @ApiProperty({
    description: 'The ObjectId of gift code',
    type: 'string',
  })
  @IsNotEmpty()
  @Length(24, 24)
  code: ObjectId | string
}

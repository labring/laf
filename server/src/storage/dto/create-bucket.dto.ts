import { ApiProperty } from '@nestjs/swagger'
import { BucketPolicy } from '@prisma/client'
import { IsEnum, IsNotEmpty, Length } from 'class-validator'

export class CreateBucketDto {
  @ApiProperty({
    description: 'The short name of the bucket which not contain the appid',
  })
  @IsNotEmpty()
  @Length(1, 32)
  shortName: string

  @ApiProperty({
    enum: BucketPolicy,
  })
  @IsEnum(BucketPolicy)
  @IsNotEmpty()
  policy: BucketPolicy

  fullname(appid: string) {
    return `${appid}-${this.shortName}`
  }
}

import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator'
import { BucketPolicy } from '../../core/api/bucket.cr'

export class CreateBucketDto {
  @ApiProperty({
    description: 'The short name of the bucket which not contain the appid',
  })
  @IsNotEmpty()
  @Length(3, 32)
  shortName: string

  @ApiProperty({
    enum: BucketPolicy,
  })
  @IsEnum(BucketPolicy)
  @IsNotEmpty()
  policy: BucketPolicy

  @ApiProperty({
    description: 'The storage capacity of the bucket: "1Gi", "0.5Gi", "100Gi"',
  })
  @IsNotEmpty()
  @IsString()
  storage: string

  fullname(appid: string) {
    return `${appid}-${this.shortName}`
  }
}

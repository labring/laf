import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { BucketPolicy } from '../entities/storage-bucket'

export class UpdateBucketDto {
  @ApiProperty({ enum: BucketPolicy })
  @IsEnum(BucketPolicy)
  policy: BucketPolicy
}

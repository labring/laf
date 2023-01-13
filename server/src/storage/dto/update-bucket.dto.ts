import { ApiProperty } from '@nestjs/swagger'
import { BucketPolicy } from '@prisma/client'
import { IsEnum } from 'class-validator'

export class UpdateBucketDto {
  @ApiProperty({ enum: BucketPolicy })
  @IsEnum(BucketPolicy)
  policy: BucketPolicy
}

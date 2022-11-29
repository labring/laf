import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { BucketPolicy } from '../entities/bucket.entity'

export class UpdateBucketDto {
  @ApiProperty({ enum: BucketPolicy })
  @IsEnum(BucketPolicy)
  policy: BucketPolicy

  @ApiProperty({
    description: 'The storage capacity of the bucket: "1Gi", "0.5Gi", "100Gi"',
  })
  @IsNotEmpty()
  @IsString()
  storage: string
}

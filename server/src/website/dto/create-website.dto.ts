import { ApiProperty } from '@nestjs/swagger'
import { DomainState } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

export class CreateWebsiteDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  bucketName: string

  @ApiProperty()
  @IsEnum(DomainState)
  @IsNotEmpty()
  state: DomainState
}

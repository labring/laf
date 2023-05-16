import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { DomainState } from 'src/gateway/entities/runtime-domain'

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

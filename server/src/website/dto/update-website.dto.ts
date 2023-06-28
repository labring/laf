import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class BindCustomDomainDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  domain: string
}

import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length } from 'class-validator'

export class CreateTriggerDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(1, 64)
  desc: string

  @ApiProperty()
  @IsNotEmpty()
  @Length(1, 64)
  cron: string

  @ApiProperty()
  @IsNotEmpty()
  @Length(1, 255)
  target: string
}

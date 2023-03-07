import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ApplicationState } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator'

enum CreateApplicationState {
  Running = 'Running',
  Stopped = 'Stopped',
}

export class CreateApplicationDto {
  @ApiProperty({ required: true })
  @Length(1, 64)
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({
    default: CreateApplicationState.Running,
    enum: CreateApplicationState,
  })
  @IsNotEmpty()
  @IsEnum(CreateApplicationState)
  state: ApplicationState

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  regionId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  bundleId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  runtimeId: string

  validate(): string | null {
    return null
  }
}

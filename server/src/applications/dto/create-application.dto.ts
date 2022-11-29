import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, Length } from 'class-validator'
import { ApplicationState } from '../entities/application.entity'

export class CreateApplicationDto {
  @ApiProperty({ required: true })
  @Length(1, 64)
  @IsNotEmpty()
  displayName: string

  @ApiPropertyOptional({
    default: ApplicationState.ApplicationStateRunning,
    enum: ApplicationState,
  })
  @IsNotEmpty()
  @IsEnum(ApplicationState)
  state: ApplicationState

  @ApiProperty()
  @IsNotEmpty()
  region: string

  @ApiProperty()
  @IsNotEmpty()
  bundleName: string

  @ApiProperty()
  @IsNotEmpty()
  runtimeName: string

  validate(): string | null {
    return null
  }
}

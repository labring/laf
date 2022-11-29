import { ApiProperty } from '@nestjs/swagger'
import { ApplicationState } from '../entities/application.entity'

export class CreateApplicationDto {
  @ApiProperty({ required: true })
  displayName: string

  @ApiProperty({
    default: ApplicationState.ApplicationStateRunning,
    required: false,
    enum: ApplicationState,
  })
  state: ApplicationState

  @ApiProperty()
  region: string

  @ApiProperty()
  bundleName: string

  @ApiProperty()
  runtimeName: string

  static validate(dto: CreateApplicationDto): string | null {
    if (!dto.displayName) {
      return 'name is required'
    }
    if (!dto.state) {
      return 'state is required'
    }
    if (!dto.region) {
      return 'region is required'
    }
    if (!dto.bundleName) {
      return 'bundleName is required'
    }

    return null
  }
}

import { ApiProperty } from '@nestjs/swagger'
import { ApplicationState } from '../entities/application.entity'

export class CreateApplicationDto {
  @ApiProperty({ required: true })
  name: string

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

  validate(): string | null {
    if (!this.name) {
      return 'name is required'
    }
    if (!this.state) {
      return 'state is required'
    }
    if (!this.region) {
      return 'region is required'
    }
    if (!this.bundleName) {
      return 'bundleName is required'
    }

    return null
  }
}

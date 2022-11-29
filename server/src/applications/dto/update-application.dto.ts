import { ApiPropertyOptional } from '@nestjs/swagger'
import { ApplicationState } from '../entities/application.entity'

const STATES = ['Running', 'Stopped']
export class UpdateApplicationDto {
  /**
   * Application name
   */
  @ApiPropertyOptional()
  displayName?: string

  @ApiPropertyOptional({
    enum: STATES,
  })
  state?: ApplicationState

  static validate(dto: UpdateApplicationDto) {
    if (dto.state) {
      if (!STATES.includes(dto.state)) {
        return 'state must be running or stopped'
      }
    }

    return null
  }
}

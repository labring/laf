import { ApiPropertyOptional } from '@nestjs/swagger'
import { ApplicationState } from '../entities/application.entity'

export class UpdateApplicationDto {
  /**
   * Application name
   */
  @ApiPropertyOptional()
  displayName?: string

  @ApiPropertyOptional({
    enum: ['running', 'stopped'],
  })
  state?: ApplicationState

  validate() {
    if (this.state) {
      if (!['running', 'stopped'].includes(this.state)) {
        return 'state must be running or stopped'
      }
    }

    return null
  }
}

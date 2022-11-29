import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn } from 'class-validator'
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
  @IsIn(STATES)
  state?: ApplicationState

  validate() {
    return null
  }
}

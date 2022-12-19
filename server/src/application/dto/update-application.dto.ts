import { ApiPropertyOptional } from '@nestjs/swagger'
import { ApplicationState } from '@prisma/client'
import { IsIn } from 'class-validator'

const STATES = [
  ApplicationState.Running,
  ApplicationState.Stopped,
  ApplicationState.Restarting,
]
export class UpdateApplicationDto {
  /**
   * Application name
   */
  @ApiPropertyOptional()
  name?: string

  @ApiPropertyOptional({
    enum: ApplicationState,
  })
  @IsIn(STATES)
  state?: ApplicationState

  validate() {
    return null
  }
}

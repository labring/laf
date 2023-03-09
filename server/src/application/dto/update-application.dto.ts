import { ApiPropertyOptional } from '@nestjs/swagger'
import { ApplicationState } from '@prisma/client'
import { IsIn, IsString, Length } from 'class-validator'

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
  @IsString()
  @Length(1, 64)
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

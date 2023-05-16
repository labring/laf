import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsString, Length } from 'class-validator'
import { ApplicationState } from '../entities/application'

const STATES = [
  ApplicationState.Running,
  ApplicationState.Stopped,
  ApplicationState.Restarting,
]
export class UpdateApplicationDto {
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

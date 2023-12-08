import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsNotEmpty, IsString, Length } from 'class-validator'
import { ApplicationState } from '../entities/application'
import { UpdateApplicationBundleDto } from './update-application.dto'

const STATES = [ApplicationState.Running]

export class CreateApplicationDto extends UpdateApplicationBundleDto {
  @ApiProperty()
  @IsString()
  @Length(1, 64)
  name: string

  @ApiProperty({
    default: ApplicationState.Running,
    enum: STATES,
  })
  @IsIn(STATES)
  state: ApplicationState

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  regionId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  runtimeId: string

  validate() {
    return super.validate()
  }
}

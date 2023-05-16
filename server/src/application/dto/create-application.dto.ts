import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsInt, IsNotEmpty, IsString, Length } from 'class-validator'
import { ApplicationState } from '../entities/application'

const STATES = [ApplicationState.Running]

export class CreateApplicationDto {
  /**
   * Application name
   */
  @ApiPropertyOptional()
  @IsString()
  @Length(1, 64)
  name?: string

  @ApiPropertyOptional({
    default: ApplicationState.Running,
    enum: STATES,
  })
  @IsIn(STATES)
  state?: ApplicationState

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  regionId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  runtimeId: string

  // build resources
  @ApiProperty({ example: 200 })
  @IsNotEmpty()
  @IsInt()
  cpu: number

  @ApiProperty({ example: 256 })
  @IsNotEmpty()
  @IsInt()
  memory: number

  @ApiProperty({ example: 2048 })
  @IsNotEmpty()
  @IsInt()
  databaseCapacity: number

  @ApiProperty({ example: 4096 })
  @IsNotEmpty()
  @IsInt()
  storageCapacity: number

  validate() {
    return null
  }
}

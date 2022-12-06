import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ApplicationState } from '@prisma/client'
import { IsEnum, IsNotEmpty, Length } from 'class-validator'

export class CreateApplicationDto {
  @ApiProperty({ required: true })
  @Length(1, 64)
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({
    default: ApplicationState.Running,
    enum: ApplicationState,
  })
  @IsNotEmpty()
  @IsEnum(ApplicationState)
  state: ApplicationState

  @ApiProperty()
  @IsNotEmpty()
  region: string

  @ApiProperty()
  @IsNotEmpty()
  bundleName: string

  @ApiProperty()
  @IsNotEmpty()
  runtimeName: string

  validate(): string | null {
    return null
  }
}

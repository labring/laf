import { IsEnum, IsNotEmpty } from 'class-validator'
import { DedicatedDatabaseState } from '../entities/dedicated-database'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateDedicatedDatabaseStateDto {
  @ApiProperty({ enum: DedicatedDatabaseState })
  @IsEnum(DedicatedDatabaseState)
  @IsNotEmpty()
  state: DedicatedDatabaseState
}

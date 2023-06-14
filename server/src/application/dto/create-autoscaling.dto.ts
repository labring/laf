import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Max,
  Min,
  ValidateIf,
} from 'class-validator'

export class CreateAutoscalingDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  enable: boolean

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(19)
  @ValidateIf(({ enable }) => enable)
  minReplicas: number

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(2)
  @Max(20)
  @ValidateIf(({ enable }) => enable)
  maxReplicas: number

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @ValidateIf(({ enable }) => enable)
  targetCPUUtilizationPercentage?: number

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @ValidateIf(({ enable }) => enable)
  targetMemoryUtilizationPercentage?: number

  validate() {
    if (this.enable) {
      if (this.maxReplicas <= this.minReplicas) {
        return 'Max replicas must be smaller than min replicas.'
      }
      if (
        !this.targetCPUUtilizationPercentage &&
        !this.targetMemoryUtilizationPercentage
      ) {
        return 'Either targetCPUUtilizationPercentage or targetMemoryUtilizationPercentage must be specified.'
      }
    }
    return null
  }
}

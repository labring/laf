import { ApiProperty } from '@nestjs/swagger'
import {
  IsArray,
  IsEnum,
  IsIn,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator'
import { MonitorMetric } from '../monitor.service'
import { Transform } from 'class-transformer'

export class QueryMetricsDto {
  @ApiProperty({ isArray: true, enum: MonitorMetric })
  @IsEnum(MonitorMetric, { each: true })
  @IsArray()
  q: MonitorMetric[]

  @ApiProperty({
    minimum: 60,
    maximum: 3600,
    description: 'Query step in seconds',
  })
  @IsNumber()
  @Min(60)
  @Max(3600)
  @Transform(({ value }) => Number(value))
  step: number

  @ApiProperty({
    description: 'Query type',
    enum: ['range', 'instant'],
  })
  @IsString()
  @IsIn(['range', 'instant'])
  type: 'range' | 'instant'
}

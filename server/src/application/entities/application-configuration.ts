import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export class EnvironmentVariable {
  @ApiProperty()
  name: string

  @ApiProperty()
  value: string
}

export class Autoscaling {
  @ApiProperty()
  enable: boolean

  @ApiProperty()
  minReplicas: number

  @ApiProperty()
  maxReplicas: number

  @ApiProperty()
  targetCPUUtilizationPercentage?: number

  @ApiProperty()
  targetMemoryUtilizationPercentage?: number
}

export class ApplicationConfiguration {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty()
  appid: string

  @ApiProperty({ isArray: true, type: EnvironmentVariable })
  environments: EnvironmentVariable[]

  @ApiProperty()
  dependencies: string[]

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

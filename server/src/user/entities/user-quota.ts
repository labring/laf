import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

type LimitOfDatabaseSyncCount = {
  countLimit: number
  timePeriodInSeconds: number
}

export class UserQuota {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty({ type: String })
  uid: ObjectId

  @ApiProperty()
  limitOfCPU: number

  @ApiProperty()
  limitOfMemory: number

  @ApiProperty()
  limitCountOfApplication: number

  @ApiProperty({
    description: 'Limits of database synchronization count and time period.',
    type: { countLimit: Number, timePeriodInSeconds: Number },
  })
  limitOfDatabaseSyncCount: LimitOfDatabaseSyncCount

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

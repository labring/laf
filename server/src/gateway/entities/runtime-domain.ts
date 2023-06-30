import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export enum DomainPhase {
  Creating = 'Creating',
  Created = 'Created',
  Deleting = 'Deleting',
  Deleted = 'Deleted',
}

export enum DomainState {
  Active = 'Active',
  Inactive = 'Inactive',
  Deleted = 'Deleted',
}

export class RuntimeDomain {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty()
  appid: string

  @ApiProperty()
  domain: string

  @ApiPropertyOptional()
  customDomain?: string

  @ApiProperty({ enum: DomainState })
  state: DomainState

  @ApiProperty({ enum: DomainPhase })
  phase: DomainPhase

  lockedAt: Date

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  constructor(partial: Partial<RuntimeDomain>) {
    Object.assign(this, partial)
  }
}

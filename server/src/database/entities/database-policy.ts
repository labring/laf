import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export class DatabasePolicy {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty()
  appid: string

  @ApiProperty()
  name: string

  @ApiPropertyOptional()
  injector?: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  constructor(partial: Partial<DatabasePolicy>) {
    Object.assign(this, partial)
  }
}

export class DatabasePolicyRule {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty()
  appid: string

  @ApiProperty()
  policyName: string

  @ApiProperty()
  collectionName: string

  @ApiProperty()
  value: any

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  constructor(partial: Partial<DatabasePolicyRule>) {
    Object.assign(this, partial)
  }
}

export class DatabasePolicyWithRules extends DatabasePolicy {
  @ApiProperty({ type: [DatabasePolicyRule] })
  rules: DatabasePolicyRule[]
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  CloudFunctionSource,
  HttpMethod,
} from 'src/function/entities/cloud-function'
import { EnvironmentVariable } from 'src/application/entities/application-configuration'
import { ObjectId } from 'mongodb'

export enum RelationState {
  Enabled = 'Active',
  Disabled = 'Inactive',
}

export class FunctionTemplate {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty({ type: String })
  uid: ObjectId

  @ApiProperty()
  name: string

  @ApiProperty()
  dependencies: string[]

  @ApiProperty({ isArray: true, type: EnvironmentVariable })
  environments: EnvironmentVariable[]

  @ApiProperty()
  private: boolean

  @ApiProperty()
  isRecommended: boolean

  @ApiProperty()
  description: string

  @ApiProperty()
  star: number

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  @ApiPropertyOptional()
  tags?: string[]

  @ApiPropertyOptional()
  category?: string
}

export class FunctionTemplateItem {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty({ type: String })
  templateId: ObjectId

  @ApiProperty()
  name: string

  @ApiProperty()
  desc: string

  @ApiProperty()
  source: Partial<CloudFunctionSource>

  @ApiProperty({ type: [String], enum: HttpMethod })
  methods: HttpMethod[]

  createdAt: Date

  updatedAt: Date
}

export class FunctionTemplateStarRelation {
  @ApiProperty({ type: String })
  _id?: ObjectId
  @ApiProperty({ type: String })
  uid: ObjectId
  @ApiProperty({ type: String })
  templateId: ObjectId
  @ApiProperty()
  createdAt: Date
  @ApiProperty()
  updatedAt: Date
  @ApiProperty({ type: String })
  state?: RelationState
}

export class FunctionTemplateUseRelation {
  @ApiProperty({ type: String })
  _id?: ObjectId
  @ApiProperty({ type: String })
  uid: ObjectId
  @ApiProperty({ type: String })
  templateId: ObjectId
  @ApiProperty()
  createdAt: Date
  @ApiProperty()
  updatedAt: Date
  @ApiProperty({ type: String })
  state?: RelationState
}

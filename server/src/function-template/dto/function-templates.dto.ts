import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { HttpMethod } from 'src/function/entities/cloud-function'
import { EnvironmentVariable } from 'src/application/entities/application-configuration'
import { ObjectId } from 'mongodb'
import { FunctionTemplate } from '../entities/function-template'

class FunctionTemplateItemSource {
  @ApiProperty({ description: 'The source code of the function' })
  code: string
}

class UserInfo {
  @ApiPropertyOptional()
  username?: string
  @ApiPropertyOptional()
  email?: string
}

class FunctionTemplateItems {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty({ type: String })
  templateId: ObjectId

  @ApiProperty()
  name: string

  @ApiProperty()
  desc: string

  @ApiProperty()
  source: FunctionTemplateItemSource

  @ApiProperty({ type: [String], enum: HttpMethod })
  methods: HttpMethod[]

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
export class FunctionTemplatesDto {
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

  @ApiPropertyOptional({ type: [FunctionTemplateItems] })
  items: FunctionTemplateItems[]

  @ApiPropertyOptional({ type: UserInfo })
  user?: UserInfo

  @ApiProperty({ type: String })
  author?: string

  @ApiProperty({ type: Boolean })
  stared?: boolean
}

export class GetMyStaredFunctionTemplatesDto {
  @ApiProperty({ type: String })
  _id: ObjectId

  @ApiProperty({ type: String })
  uid: ObjectId

  @ApiProperty({ type: String })
  templateId: ObjectId

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  @ApiProperty({ type: [FunctionTemplate] })
  functionTemplate: FunctionTemplate[]

  @ApiProperty({ type: [FunctionTemplateItems] })
  items: FunctionTemplateItems[]
}

export class GetMyRecentUseFunctionTemplatesDto {
  @ApiProperty({ type: String })
  _id: ObjectId

  @ApiProperty({ type: String })
  uid: ObjectId

  @ApiProperty({ type: String })
  templateId: ObjectId

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  @ApiProperty({ type: [FunctionTemplate] })
  functionTemplate: FunctionTemplate[]

  @ApiProperty({ type: [FunctionTemplateItems] })
  items: FunctionTemplateItems[]
}

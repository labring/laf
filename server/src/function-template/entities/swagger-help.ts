import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  CloudFunction,
  CloudFunctionSource,
  HttpMethod,
} from 'src/function/entities/cloud-function'
import { EnvironmentVariable } from 'src/application/entities/application-configuration'
import { ObjectId } from 'mongodb'
import { User } from 'src/user/entities/user'
import { FunctionTemplate, FunctionTemplateItem } from './function-template'

class FunctionTemplateItemSourceSwagger {
  @ApiProperty({ description: 'The source code of the function' })
  code: string
}

class FunctionTemplateItemSwagger {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty({ type: String })
  templateId: ObjectId

  @ApiProperty()
  name: string

  @ApiProperty()
  desc: string

  @ApiProperty()
  source: FunctionTemplateItemSourceSwagger

  @ApiProperty({ type: [String], enum: HttpMethod })
  methods: HttpMethod[]

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
export class FunctionTemplateSwagger {
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

  @ApiPropertyOptional({ type: [FunctionTemplateItemSwagger] })
  items: FunctionTemplateItemSwagger[]
}

export class GetFunctionTemplateUsedByItemSwagger {
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

  @ApiProperty({
    type: [User],
  })
  users: User[]
}

export class GetMyStaredFunctionTemplateSwagger {
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

  @ApiProperty({ type: [FunctionTemplateItemSwagger] })
  items: FunctionTemplateItemSwagger[]
}

export class GetMyRecentUseFunctionTemplateSwagger {
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

  @ApiProperty({ type: [FunctionTemplateItemSwagger] })
  items: FunctionTemplateItemSwagger[]
}

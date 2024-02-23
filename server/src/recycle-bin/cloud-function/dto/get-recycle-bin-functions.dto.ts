import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator'
import { HTTP_METHODS } from 'src/constants'
import { HttpMethod } from 'src/function/entities/cloud-function'

class CloudFunctionSourceDto {
  @ApiProperty()
  code: string

  @ApiProperty()
  compiled: string

  @ApiPropertyOptional()
  uri?: string

  @ApiProperty()
  version: number

  @ApiPropertyOptional()
  hash?: string

  @ApiPropertyOptional()
  lang?: string
}

export class FunctionRecycleBinItemsDto {
  @ApiProperty()
  _id: string

  @ApiProperty()
  appid: string

  @ApiProperty({
    description: 'Function name is unique in the application',
  })
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_.\-](?:[a-zA-Z0-9_.\-/]{0,254}[a-zA-Z0-9_.\-])?$/)
  name: string

  @ApiProperty({ type: CloudFunctionSourceDto })
  source: CloudFunctionSourceDto

  @ApiPropertyOptional()
  @MaxLength(256)
  description: string

  @ApiPropertyOptional({ type: [String] })
  @IsString({ each: true })
  @IsArray()
  @MaxLength(16, { each: true })
  @IsNotEmpty({ each: true })
  tags: string[]

  @ApiProperty({ type: [String], enum: HttpMethod })
  @IsIn(HTTP_METHODS, { each: true })
  methods: HttpMethod[] = []

  @ApiPropertyOptional()
  params?: any

  @ApiProperty({ type: 'date' })
  createdAt: Date

  @ApiProperty({ type: 'date' })
  updatedAt: Date

  @ApiProperty()
  createdBy: string
}

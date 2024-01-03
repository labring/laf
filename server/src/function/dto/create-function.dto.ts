import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator'
import { HTTP_METHODS } from '../../constants'
import { HttpMethod } from '../entities/cloud-function'

export class CreateFunctionDto {
  @ApiProperty({
    description: 'Function name is unique in the application',
  })
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_.\-](?:[a-zA-Z0-9_.\-/]{0,254}[a-zA-Z0-9_.\-])?$/)
  name: string

  @ApiPropertyOptional()
  @MaxLength(256)
  description: string

  @ApiProperty({ type: [String], enum: HttpMethod })
  @IsIn(HTTP_METHODS, { each: true })
  methods: HttpMethod[] = []

  @ApiProperty({ description: 'The source code of the function' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1024 * 512)
  code: string

  @ApiPropertyOptional({ type: [String] })
  @IsString({ each: true })
  @IsArray()
  @MaxLength(16, { each: true })
  @IsNotEmpty({ each: true })
  tags: string[]

  validate() {
    if (this.tags?.length >= 8) {
      return 'tags length must less than 8'
    }
    if (this.name.includes('./')) {
      return 'the relative path is not allowed in function name'
    }
    return null
  }
}

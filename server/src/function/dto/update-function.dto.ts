import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator'
import { HTTP_METHODS } from '../../constants'
import { HttpMethod } from '../entities/cloud-function'

export class UpdateFunctionDto {
  @ApiProperty({
    description: 'Function name is unique in the application',
  })
  @IsOptional()
  @Matches(/^[a-zA-Z0-9_.\-](?:[a-zA-Z0-9_.\-/]{0,254}[a-zA-Z0-9_.\-])?$/)
  newName?: string

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

  @ApiPropertyOptional()
  @MaxLength(256)
  @IsOptional()
  changelog?: string

  validate() {
    return null
  }
}

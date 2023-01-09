import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { HttpMethod } from '@prisma/client'
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator'
import { HTTP_METHODS } from '../../constants'

export class UpdateFunctionDto {
  @ApiPropertyOptional()
  @MaxLength(256)
  description: string

  @ApiProperty()
  @IsBoolean()
  websocket: boolean

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
    return null
  }
}

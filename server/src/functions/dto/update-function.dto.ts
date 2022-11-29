import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator'
import { HTTP_METHODS } from 'src/constants'

export class UpdateFunctionDto {
  @ApiPropertyOptional()
  @MaxLength(256)
  description: string

  @ApiProperty()
  @IsBoolean()
  websocket: boolean

  @ApiProperty({ type: [String], enum: HTTP_METHODS })
  @IsIn(HTTP_METHODS, { each: true })
  methods: string[] = []

  @ApiProperty({ description: 'The source code of the function' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1024 * 512)
  codes: string

  validate() {
    return null
  }
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
} from 'class-validator'
import { HTTP_METHODS } from 'src/constants'

export class CreateFunctionDto {
  @ApiProperty({
    description: 'Function name is unique in the application',
  })
  @IsNotEmpty()
  @Length(1, 128)
  name: string

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

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsNotEmpty, IsString, Length, MaxLength } from 'class-validator'
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
  websocket: boolean

  @ApiProperty({ type: [String], enum: HTTP_METHODS })
  @IsIn(HTTP_METHODS)
  methods: string[] = []

  @ApiProperty({ description: 'The source code of the function' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1024 * 512)
  codes: string

  validate() {
    if (!this.methods) {
      this.methods = []
    }
    const valid = this.methods.every((method) => HTTP_METHODS.includes(method))
    if (!valid) {
      return 'methods is invalid'
    }

    return null
  }
}

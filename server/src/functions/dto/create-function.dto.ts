import { ApiProperty } from '@nestjs/swagger'

export class CreateFunctionDto {
  @ApiProperty({
    description: 'Function name is unique in the application',
  })
  name: string

  @ApiProperty()
  description: string

  @ApiProperty()
  websocket: boolean

  @ApiProperty({
    type: [String],
    enum: ['HEAD', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  })
  methods: string[] = []

  @ApiProperty({
    description: 'The source code of the function',
  })
  codes: string

  static validate(dto: CreateFunctionDto) {
    if (!dto.name) {
      return 'name is required'
    }

    if (!dto.methods) {
      dto.methods = []
    }

    const valid = dto.methods.every((method) => {
      return ['HEAD', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method)
    })
    if (!valid) {
      return 'methods is invalid'
    }

    return null
  }
}

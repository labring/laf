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
    enum: ['HEAD', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  })
  methods: string[] = []

  @ApiProperty({
    description: 'The source code of the function',
  })
  codes: string

  validate() {
    if (!this.name) {
      return 'name is required'
    }

    const valid = this.methods.every((method) => {
      return ['HEAD', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method)
    })
    if (!valid) {
      return 'methods is invalid'
    }

    return null
  }
}

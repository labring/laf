import { ApiProperty } from '@nestjs/swagger'

export class CreateCollectionDto {
  @ApiProperty()
  name: string

  async validate() {
    if (!this.name) {
      return 'Collection name is required'
    }

    return null
  }
}

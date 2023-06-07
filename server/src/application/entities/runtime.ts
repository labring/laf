import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export class RuntimeImageGroup {
  @ApiProperty()
  main: string

  @ApiProperty()
  init: string

  @ApiPropertyOptional()
  sidecar?: string
}

export class Runtime {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty()
  name: string

  @ApiProperty()
  type: string

  @ApiProperty()
  image: RuntimeImageGroup

  @ApiProperty()
  state: 'Active' | 'Inactive'

  @ApiProperty()
  version: string

  @ApiProperty()
  latest: boolean

  constructor(partial: Partial<Runtime>) {
    Object.assign(this, partial)
  }
}

import { ApiProperty } from '@nestjs/swagger'
import { Binary, CollectionInfo, Document } from 'mongodb'

export class Collection implements CollectionInfo {
  @ApiProperty()
  name: string

  @ApiProperty()
  type?: string

  @ApiProperty()
  options?: Document

  @ApiProperty()
  info?: { readOnly?: false; uuid?: Binary }

  @ApiProperty()
  idIndex?: Document
}

import { ApiProperty } from '@nestjs/swagger'

export class ImportDatabaseDto {
  @ApiProperty({ type: 'binary', format: 'binary' })
  file: any

  @ApiProperty({ type: 'string', description: 'source appid' })
  sourceAppid: string
}

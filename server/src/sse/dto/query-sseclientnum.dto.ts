import { ApiProperty } from '@nestjs/swagger'


export class QuerySseClientNumDto {

  @ApiProperty({ description: 'The client number' })
  total: number

}

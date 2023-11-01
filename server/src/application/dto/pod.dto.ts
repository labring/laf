import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsArray, IsString } from 'class-validator'

export class PodNamesDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  appid: string

  @ApiProperty({
    description: 'List of pod identifiers',
    example: ['pod1', 'pod2'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  pods: string[]
}

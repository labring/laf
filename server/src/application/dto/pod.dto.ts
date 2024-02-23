import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsArray, IsString } from 'class-validator'

export class PodNameListDto {
  @ApiProperty()
  appid: string

  @ApiProperty({
    description: 'List of pod identifiers',
    example: ['pod1', 'pod2'],
  })
  podNameList: string[]
}

export class ContainerNameListDto {
  @ApiProperty()
  podName: string

  @ApiProperty({
    description: 'List of container identifiers',
    example: ['container1', 'container2'],
  })
  containerNameList: string[]
}

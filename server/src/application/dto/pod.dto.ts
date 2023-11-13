import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsArray, IsString } from 'class-validator'

export class PodNameListDto {
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
  podNameList: string[]
}

export class ContainerNameListDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  podName: string

  @ApiProperty({
    description: 'List of container identifiers',
    example: ['container1', 'container2'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  containerNameList: string[]
}

import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsString } from 'class-validator'

export class CalculatePriceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  regionId: string

  // build resources
  @ApiProperty({ example: 200 })
  @IsNotEmpty()
  @IsInt()
  cpu: number

  @ApiProperty({ example: 256 })
  @IsNotEmpty()
  @IsInt()
  memory: number

  @ApiProperty({ example: 2048 })
  @IsNotEmpty()
  @IsInt()
  databaseCapacity: number

  @ApiProperty({ example: 4096 })
  @IsNotEmpty()
  @IsInt()
  storageCapacity: number

  validate() {
    return null
  }
}

export class CalculatePriceResultDto {
  @ApiProperty({ example: 0.072 })
  cpu: number

  @ApiProperty({ example: 0.036 })
  memory: number

  @ApiProperty({ example: 0.036 })
  storageCapacity: number

  @ApiProperty({ example: 0.036 })
  databaseCapacity: number

  @ApiProperty({ example: 0.18 })
  total: number
}

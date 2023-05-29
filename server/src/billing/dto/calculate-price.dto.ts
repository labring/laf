import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { UpdateApplicationBundleDto } from 'src/application/dto/update-application.dto'

export class CalculatePriceDto extends UpdateApplicationBundleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  regionId: string
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

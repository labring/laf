import { ApiProperty, OmitType } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { UpdateApplicationBundleDto } from 'src/application/dto/update-application.dto'

export class CalculatePriceDto extends OmitType(UpdateApplicationBundleDto, [
  'validate',
]) {
  @ApiProperty({ example: 0.036 })
  @IsOptional()
  @IsNumber({}, { message: 'networkTraffic must be a number' })
  networkTraffic?: number

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

  @ApiProperty({ example: 0.036, required: false })
  networkTraffic?: number

  @ApiProperty({ example: 0.036 })
  storageCapacity: number

  @ApiProperty({ example: 0.036 })
  databaseCapacity: number

  @ApiProperty({ example: 0.18 })
  total: number
}

import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, Max } from 'class-validator'

export class CreateDedicatedDatabaseDto {
  @ApiProperty({ example: 200 })
  @IsNotEmpty()
  @IsInt()
  cpu: number

  @ApiProperty({ example: 256 })
  @IsNotEmpty()
  @IsInt()
  memory: number

  @ApiProperty({ example: 1024 })
  @IsNotEmpty()
  @IsInt()
  capacity: number

  @ApiProperty({ example: 3 })
  @IsNotEmpty()
  @IsInt()
  @Max(9)
  replicas: number
}

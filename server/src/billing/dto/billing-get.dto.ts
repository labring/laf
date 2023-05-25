import { ApiProperty } from '@nestjs/swagger'
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator'

export class BillingSearchDto {
  @ApiProperty({
    description: 'Application ID',
    example: 'abc123',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Appid should only contain alphanumeric characters',
  })
  appid: string

  @ApiProperty({
    description: 'Start date',
    example: '2023-01-01',
  })
  @IsDate()
  @IsNotEmpty()
  startDate: Date

  @ApiProperty({
    description: 'End date',
    example: '2023-01-31',
  })
  @IsDate()
  @IsNotEmpty()
  endDate: Date

  @ApiProperty({
    description: 'Page number',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  page: number

  @ApiProperty({
    description: 'Page size',
    example: 10,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  pageSize: number
}

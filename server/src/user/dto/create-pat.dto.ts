import { ApiProperty } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator'

export class CreatePATDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  @ApiProperty()
  name: string

  @IsNumber()
  @IsNotEmpty()
  @Min(60)
  @Max(3600 * 24 * 365)
  @ApiProperty({ minimum: 60 })
  expiresIn: number
}

import { ApiProperty } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator'



export class CreateEventSourceDto {

  // uid       String
  // appid     String
  // payload   Json

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  uid: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  appid: string


  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  payload: any


  // @IsNumber()
  // @IsNotEmpty()
  // @Min(60)
  // @Max(3600 * 24 * 365)
  // @ApiProperty({ minimum: 60 })
  // expiresIn: number



}

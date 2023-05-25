import { ApiProperty } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
  IsEnum,
} from 'class-validator'
import { SseEventEnum, SseEventPayload } from '../types'



export class CreateEventSourceDto {

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  uid: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  appid: string

  @IsEnum(SseEventEnum)
  eventType: SseEventEnum


  @IsNotEmpty()
  @ApiProperty()
  payload: SseEventPayload
  // payload: object


  // @IsNumber()
  // @IsNotEmpty()
  // @Min(60)
  // @Max(3600 * 24 * 365)
  // @ApiProperty({ minimum: 60 })
  // expiresIn: number



}

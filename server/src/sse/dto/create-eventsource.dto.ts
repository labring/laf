import { ApiProperty } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsString,
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


}

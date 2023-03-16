import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty } from 'class-validator'

export class RenewSubscriptionDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  duration: number
}

import { ApiProperty } from '@nestjs/swagger'
import { PaymentChannelType } from '@prisma/client'
import { IsEnum, IsNumber, IsPositive, IsString } from 'class-validator'

export class CreateChargeOrderDto {
  @ApiProperty({ example: 1000 })
  @IsPositive()
  @IsNumber()
  amount: number

  @ApiProperty()
  @IsString()
  @IsEnum(PaymentChannelType)
  paymentChannel: PaymentChannelType
}

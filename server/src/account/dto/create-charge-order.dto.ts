import { ApiProperty } from '@nestjs/swagger'
import { Currency, PaymentChannelType } from '@prisma/client'
import { IsEnum, IsInt, IsPositive, IsString, Max, Min } from 'class-validator'

export class CreateChargeOrderDto {
  @ApiProperty({ example: 1000 })
  @IsPositive()
  @IsInt()
  @Min(1)
  @Max(1000000000)
  amount: number

  @ApiProperty({ example: PaymentChannelType.WeChat })
  @IsString()
  @IsEnum(PaymentChannelType)
  channel: PaymentChannelType

  @ApiProperty({ example: Currency.CNY })
  @IsString()
  @IsEnum(Currency)
  currency: Currency
}

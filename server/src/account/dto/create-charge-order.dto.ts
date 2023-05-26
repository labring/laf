import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt, IsPositive, IsString, Max, Min } from 'class-validator'
import {
  AccountChargeOrder,
  Currency,
  PaymentChannelType,
} from '../entities/account-charge-order'

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

export class WeChatPaymentCreateOrderResult {
  @ApiProperty()
  code_url: string
}

export class CreateChargeOrderOutDto {
  @ApiProperty()
  order: AccountChargeOrder

  @ApiProperty()
  result: WeChatPaymentCreateOrderResult
}

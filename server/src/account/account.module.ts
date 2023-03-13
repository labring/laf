import { Module } from '@nestjs/common'
import { AccountService } from './account.service'
import { AccountController } from './account.controller'
import { WeChatPaymentService } from './payment/wechat-pay.service'
import { PaymentChannelService } from './payment/payment-channel.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  providers: [AccountService, WeChatPaymentService, PaymentChannelService],
  controllers: [AccountController],
  exports: [WeChatPaymentService, AccountService, PaymentChannelService],
})
export class AccountModule {}

import { Module } from '@nestjs/common'
import { AccountService } from './account.service'
import { AccountController } from './account.controller'
import { WeChatPayService } from './payment/wechat-pay.service'
import { PaymentChannelService } from './payment/payment-channel.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  providers: [AccountService, WeChatPayService, PaymentChannelService],
  controllers: [AccountController],
  exports: [WeChatPayService, AccountService, PaymentChannelService],
})
export class AccountModule {}

import { Module } from '@nestjs/common'
import { AccountService } from './account.service'
import { AccountController } from './account.controller'
import { WeChatPayService } from './payment/wechat-pay.service'
import { PaymentChannelService } from './payment/payment-channel.service'
import { HttpModule } from '@nestjs/axios'
import { AccountBalanceGuard } from './account-balance.guard'

@Module({
  imports: [HttpModule],
  providers: [
    AccountService,
    WeChatPayService,
    PaymentChannelService,
    AccountBalanceGuard,
  ],
  controllers: [AccountController],
  exports: [
    WeChatPayService,
    AccountService,
    PaymentChannelService,
    AccountBalanceGuard,
  ],
})
export class AccountModule {}

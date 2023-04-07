import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AccountChargePhase } from '@prisma/client'
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard'
import { PrismaService } from 'src/prisma/prisma.service'
import { IRequest } from 'src/utils/interface'
import { ResponseUtil } from 'src/utils/response'
import { AccountService } from './account.service'
import { CreateChargeOrderDto } from './dto/create-charge-order.dto'
import { PaymentChannelService } from './payment/payment-channel.service'
import { WeChatPayOrderResponse, WeChatPayTradeState } from './payment/types'
import { WeChatPayService } from './payment/wechat-pay.service'
import { Response } from 'express'
import * as assert from 'assert'

@ApiTags('Account')
@Controller('accounts')
@ApiBearerAuth('Authorization')
export class AccountController {
  private readonly logger = new Logger(AccountController.name)

  constructor(
    private readonly accountService: AccountService,
    private readonly paymentService: PaymentChannelService,
    private readonly wechatPayService: WeChatPayService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get account info
   */
  @ApiOperation({ summary: 'Get account info' })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findOne(@Req() req: IRequest) {
    const user = req.user
    const data = await this.accountService.findOne(user.id)
    return data
  }

  /**
   * Get charge order
   */
  @ApiOperation({ summary: 'Get charge order' })
  @UseGuards(JwtAuthGuard)
  @Get('charge-order/:id')
  async getChargeOrder(@Req() req: IRequest, @Param('id') id: string) {
    const user = req.user
    const data = await this.accountService.findOneChargeOrder(user.id, id)
    return data
  }

  /**
   * Create charge order
   */
  @ApiOperation({ summary: 'Create charge order' })
  @UseGuards(JwtAuthGuard)
  @Post('charge-order')
  async charge(@Req() req: IRequest, @Body() dto: CreateChargeOrderDto) {
    const user = req.user
    const { amount, currency, channel } = dto

    // create charge order
    const order = await this.accountService.createChargeOrder(
      user.id,
      amount,
      currency,
      channel,
    )

    // invoke payment
    const result = await this.accountService.pay(
      channel,
      order.id,
      amount,
      currency,
      'laf account charge',
    )

    return ResponseUtil.ok({
      order,
      result,
    })
  }

  /**
   * WeChat payment notify
   */
  @Post('payment/wechat-notify')
  async wechatNotify(@Req() req: IRequest, @Res() res: Response) {
    try {
      // get headers
      const headers = req.headers
      const nonce = headers['wechatpay-nonce'] as string
      const timestamp = headers['wechatpay-timestamp'] as string
      const signature = headers['wechatpay-signature'] as string
      const serial = headers['wechatpay-serial'] as string

      // get body
      const body = req.body as WeChatPayOrderResponse

      const spec = await this.paymentService.getWeChatPaySpec()
      const result = await this.wechatPayService.getWeChatPayNotifyResult(
        spec,
        {
          timestamp,
          nonce,
          body,
          serial,
          signature,
        },
      )

      this.logger.debug(result)

      const tradeOrderId = result.out_trade_no
      if (result.trade_state !== WeChatPayTradeState.SUCCESS) {
        await this.prisma.accountChargeOrder.update({
          where: { id: tradeOrderId },
          data: {
            phase: AccountChargePhase.Failed,
            result: result as any,
          },
        })
        this.logger.log(
          `wechatpay order failed: ${tradeOrderId} ${result.trade_state}`,
        )
        return res.status(200).send()
      }

      // start transaction
      await this.prisma.$transaction(async (tx) => {
        // get order
        const order = await tx.accountChargeOrder.findFirst({
          where: { id: tradeOrderId, phase: AccountChargePhase.Pending },
        })
        if (!order) {
          this.logger.error(`wechatpay order not found: ${tradeOrderId}`)
          return
        }

        // update order to success
        const res = await tx.accountChargeOrder.updateMany({
          where: { id: tradeOrderId, phase: AccountChargePhase.Pending },
          data: { phase: AccountChargePhase.Paid, result: result as any },
        })

        if (res.count === 0) {
          this.logger.error(`wechatpay order not found: ${tradeOrderId}`)
          return
        }

        // get account
        const account = await tx.account.findFirst({
          where: { id: order.accountId },
        })
        assert(account, `account not found ${order.accountId}`)

        // update account balance
        await tx.account.update({
          where: { id: order.accountId },
          data: { balance: { increment: order.amount } },
        })

        // create account transaction
        await tx.accountTransaction.create({
          data: {
            accountId: order.accountId,
            amount: order.amount,
            balance: order.amount + account.balance,
            message: 'account charge',
          },
        })

        this.logger.log(`wechatpay order success: ${tradeOrderId}`)
      })
    } catch (err) {
      this.logger.error(err)
      return res.status(400).send({ code: 'FAIL', message: 'ERROR' })
    }

    return res.status(200).send()
  }
}

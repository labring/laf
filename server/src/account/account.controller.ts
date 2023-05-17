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
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard'
import { IRequest } from 'src/utils/interface'
import { ResponseUtil } from 'src/utils/response'
import { AccountService } from './account.service'
import { CreateChargeOrderDto } from './dto/create-charge-order.dto'
import { PaymentChannelService } from './payment/payment-channel.service'
import {
  WeChatPayChargeOrder,
  WeChatPayOrderResponse,
  WeChatPayTradeState,
} from './payment/types'
import { WeChatPayService } from './payment/wechat-pay.service'
import { Response } from 'express'
import * as assert from 'assert'
import { ServerConfig } from 'src/constants'
import { AccountChargePhase } from './entities/account-charge-order'
import { ObjectId } from 'mongodb'
import { SystemDatabase } from 'src/database/system-database'
import { Account } from './entities/account'
import { AccountTransaction } from './entities/account-transaction'

@ApiTags('Account')
@Controller('accounts')
@ApiBearerAuth('Authorization')
export class AccountController {
  private readonly logger = new Logger(AccountController.name)

  constructor(
    private readonly accountService: AccountService,
    private readonly paymentService: PaymentChannelService,
    private readonly wechatPayService: WeChatPayService,
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
    const data = await this.accountService.findOneChargeOrder(
      user.id,
      new ObjectId(id),
    )
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
      order._id,
      amount,
      currency,
      `${ServerConfig.SITE_NAME} recharge`,
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

      const db = SystemDatabase.db

      const tradeOrderId = new ObjectId(result.out_trade_no)
      if (result.trade_state !== WeChatPayTradeState.SUCCESS) {
        await db
          .collection<WeChatPayChargeOrder>('AccountChargeOrder')
          .updateOne(
            { _id: tradeOrderId },
            { $set: { phase: AccountChargePhase.Failed, result: result } },
          )

        this.logger.log(
          `wechatpay order failed: ${tradeOrderId} ${result.trade_state}`,
        )
        return res.status(200).send()
      }

      // start transaction
      const client = SystemDatabase.client
      const session = client.startSession()
      await session.withTransaction(async () => {
        // get order
        const order = await db
          .collection<WeChatPayChargeOrder>('AccountChargeOrder')
          .findOne(
            { _id: tradeOrderId, phase: AccountChargePhase.Pending },
            { session },
          )
        if (!order) {
          this.logger.error(`wechatpay order not found: ${tradeOrderId}`)
          return
        }

        // update order to success
        const res = await db
          .collection<WeChatPayChargeOrder>('AccountChargeOrder')
          .updateOne(
            { _id: tradeOrderId, phase: AccountChargePhase.Pending },
            { $set: { phase: AccountChargePhase.Paid, result: result } },
            { session },
          )

        if (res.modifiedCount === 0) {
          this.logger.error(`wechatpay order not found: ${tradeOrderId}`)
          return
        }

        // get account
        const account = await db
          .collection<Account>('Account')
          .findOne({ _id: order.accountId }, { session })
        assert(account, `account not found: ${order.accountId}`)

        // update account balance
        await db
          .collection<Account>('Account')
          .updateOne(
            { _id: order.accountId },
            { $inc: { balance: order.amount } },
            { session },
          )

        // create transaction
        await db.collection<AccountTransaction>('AccountTransaction').insertOne(
          {
            accountId: order.accountId,
            amount: order.amount,
            balance: account.balance + order.amount,
            message: 'Recharge by WeChat Pay',
            orderId: order._id,
            createdAt: new Date(),
          },
          { session },
        )

        this.logger.log(`wechatpay order success: ${tradeOrderId}`)
      })
    } catch (err) {
      this.logger.error(err)
      return res.status(400).send({ code: 'FAIL', message: 'ERROR' })
    }

    return res.status(200).send()
  }
}

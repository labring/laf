import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { IRequest, IResponse } from 'src/utils/interface'
import {
  ApiResponseArray,
  ApiResponseObject,
  ApiResponsePagination,
  ResponseUtil,
} from 'src/utils/response'
import { AccountService } from './account.service'
import {
  CreateChargeOrderDto,
  CreateChargeOrderOutDto,
} from './dto/create-charge-order.dto'
import { UseGiftCodeDto } from './dto/use-gift-code.dto'
import { PaymentChannelService } from './payment/payment-channel.service'
import {
  WeChatPayChargeOrder,
  WeChatPayOrderResponse,
  WeChatPayTradeState,
} from './payment/types'
import { WeChatPayService } from './payment/wechat-pay.service'
import { ServerConfig } from 'src/constants'
import {
  AccountChargeOrder,
  AccountChargePhase,
} from './entities/account-charge-order'
import { ObjectId } from 'mongodb'
import { SystemDatabase } from 'src/system-database'
import { Account } from './entities/account'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { AccountChargeReward } from './entities/account-charge-reward'
import { InviteCode } from 'src/authentication/entities/invite-code'
import { InviteCodeProfit } from './dto/invite-code.dto'
import { AccountChargeOrderQuery } from './interface/account-query.interface'
import { GetAccountChargeOrdersDto } from './dto/get-charge-order.dto'

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
  @ApiResponseObject(Account)
  @UseGuards(JwtAuthGuard)
  @Get()
  async findOne(@Req() req: IRequest) {
    const user = req.user
    const data = await this.accountService.findOne(user._id)
    data.balance = Math.floor(data.balance)
    return ResponseUtil.ok(data)
  }

  /**
   * Get charge order total amount
   */
  @ApiOperation({ summary: 'Get charge order total amount' })
  @ApiResponseObject(Number)
  @UseGuards(JwtAuthGuard)
  @Get('charge-order/amount')
  async getChargeOrderAmount(
    @Req() req: IRequest,
    @Query('startTime') startTime?: number,
    @Query('endTime') endTime?: number,
  ) {
    const user = req.user
    const query: AccountChargeOrderQuery = {
      startTime: startTime
        ? new Date(startTime)
        : new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      endTime: endTime ? new Date(endTime) : new Date(),
    }
    const amount = await this.accountService.getUserRecharge(user._id, query)
    return ResponseUtil.ok(amount)
  }

  /**
   * Get charge order
   */
  @ApiOperation({ summary: 'Get charge order' })
  @ApiResponseObject(AccountChargeOrder)
  @UseGuards(JwtAuthGuard)
  @Get('charge-order/:id')
  async getChargeOrder(@Req() req: IRequest, @Param('id') id: string) {
    const user = req.user
    const data = await this.accountService.findOneChargeOrder(
      user._id,
      new ObjectId(id),
    )
    return ResponseUtil.ok(data)
  }

  /**
   * get all charge order
   */
  @ApiOperation({ summary: 'get all charge order' })
  @ApiResponsePagination(GetAccountChargeOrdersDto)
  @UseGuards(JwtAuthGuard)
  @Get('charge-orders')
  async getChargeRecords(
    @Req() req: IRequest,
    @Query('id') id?: string,
    @Query('channel') channel?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('state') state?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const query: AccountChargeOrderQuery = {
      page: page || 1,
      pageSize: pageSize || 12,
    }

    if (query.pageSize > 100) {
      query.pageSize = 100
    }

    if (id) {
      query.id = new ObjectId(id)
    }

    if (channel) {
      query.channel = channel
    }

    if (state) {
      query.phase = state
    }

    if (startTime) {
      query.startTime = new Date(startTime)
    }

    if (endTime) {
      query.endTime = new Date(endTime)
    }

    const res = await this.accountService.getAllChargeOrders(
      req.user._id,
      query,
    )

    return ResponseUtil.ok(res)
  }

  /**
   * Create charge order
   */
  @ApiOperation({ summary: 'Create charge order' })
  @ApiResponseObject(CreateChargeOrderOutDto)
  @UseGuards(JwtAuthGuard)
  @Post('charge-order')
  async charge(@Req() req: IRequest, @Body() dto: CreateChargeOrderDto) {
    const user = req.user
    const { amount, currency, channel } = dto

    // create charge order
    const order = await this.accountService.createChargeOrder(
      user._id,
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
   * Get charge reward list
   */
  @ApiOperation({ summary: 'Get charge reward list' })
  @ApiResponseArray(AccountChargeReward)
  @UseGuards(JwtAuthGuard)
  @Get('charge-reward')
  async getChargeRewardList() {
    const rewards = await this.accountService.findAllChargeRewards()
    return ResponseUtil.ok(rewards)
  }

  /**
   * WeChat payment notify
   */
  @Post('payment/wechat-notify')
  async wechatNotify(@Req() req: IRequest, @Res() res: IResponse) {
    // start transaction
    const client = SystemDatabase.client
    const session = client.startSession()
    session.startTransaction()

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

      // update order to success
      const resultOfOrder = await db
        .collection<WeChatPayChargeOrder>('AccountChargeOrder')
        .findOneAndUpdate(
          { _id: tradeOrderId, phase: AccountChargePhase.Pending },
          { $set: { phase: AccountChargePhase.Paid, result: result } },
          { session, returnDocument: 'after' },
        )

      const order = resultOfOrder.value

      if (!order) {
        this.logger.error(`wechatpay order not found: ${tradeOrderId}`)
        return
      }

      // get max reward
      const reward = await db
        .collection<AccountChargeReward>('AccountChargeReward')
        .findOne(
          {
            amount: { $lte: order.amount },
          },
          { sort: { amount: -1 } },
        )

      const realAmount = reward ? reward.reward + order.amount : order.amount

      await this.accountService.chargeWithTransaction(
        order.accountId,
        realAmount,
        'Recharge by WeChat Pay',
        session,
        { reward: reward?.reward, orderId: order._id },
      )

      this.logger.log(`wechatpay order success: ${tradeOrderId}`)

      await session.commitTransaction()
    } catch (err) {
      await session.abortTransaction()
      this.logger.error(err)
      return res.status(400).send({ code: 'FAIL', message: 'ERROR' })
    } finally {
      session.endSession()
    }

    return res.status(200).send()
  }

  /**
   * Use a gift code
   */
  @ApiOperation({ summary: 'Use a gift code' })
  @ApiResponseObject(Account)
  @UseGuards(JwtAuthGuard)
  @Post('gift-code')
  async giftCode(@Req() req: IRequest, @Body() dto: UseGiftCodeDto) {
    const giftCode = await this.accountService.findOneGiftCode(dto.code)
    if (!giftCode) {
      return ResponseUtil.error("gift code doesn't exist")
    }
    if (giftCode.expiredAt < new Date()) {
      return ResponseUtil.error('gift code has expired')
    }
    if (giftCode.used === true) {
      return ResponseUtil.error('gift code has been used')
    }
    const res = await this.accountService.useGiftCode(req.user._id, dto.code)
    return ResponseUtil.ok(res)
  }

  /**
   * get a invite code
   */
  @ApiOperation({ summary: 'get a invite code' })
  @ApiResponseObject(InviteCode)
  @UseGuards(JwtAuthGuard)
  @Get('invite-code')
  async inviteCode(@Req() req: IRequest) {
    const found = await this.accountService.findOneInviteCode(req.user._id)
    if (found) {
      return ResponseUtil.ok(found)
    }
    const res = await this.accountService.generateInviteCode(req.user._id)
    return ResponseUtil.ok(res)
  }

  /**
   * get invite code profit
   */
  @ApiOperation({ summary: 'get invite code profit' })
  @ApiResponsePagination(InviteCodeProfit)
  @UseGuards(JwtAuthGuard)
  @Get('invite-profit')
  async inviteCodeProfit(
    @Req() req: IRequest,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    page = page || 1
    pageSize = pageSize || 12
    if (pageSize > 100) {
      pageSize = 100
    }
    const res = await this.accountService.getInviteProfit(
      req.user._id,
      page,
      pageSize,
    )
    return ResponseUtil.ok(res)
  }
}

import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard'
import { IRequest } from 'src/utils/interface'
import { PriceRound } from 'src/utils/number'
import { ResponseUtil } from 'src/utils/response'
import { AccountService } from './account.service'
import { CreateChargeOrderDto } from './dto/create-charge-order.dto'

@ApiTags('Account')
@Controller('accounts')
@ApiBearerAuth('Authorization')
export class AccountController {
  private readonly logger = new Logger(AccountController.name)

  constructor(private readonly accountService: AccountService) {}

  /**
   * Get account info
   */
  @ApiOperation({ summary: 'Get account info' })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findOne(@Req() req: IRequest) {
    const user = req.user
    const data = await this.accountService.findOne(user.id)
    data.balance = data.balance / 100
    return data
  }

  /**
   * Create charge order
   */
  @ApiOperation({ summary: 'Create charge order' })
  @UseGuards(JwtAuthGuard)
  @Post('charge')
  async charge(@Req() req: IRequest, @Body() dto: CreateChargeOrderDto) {
    const user = req.user
    const amount = PriceRound(dto.amount)

    // invoke payment
    const { result, channelData } = await this.accountService.pay(
      dto.paymentChannel,
      amount,
    )

    // create charge order
    const order = await this.accountService.createChargeOrder(
      user.id,
      amount,
      dto.paymentChannel,
      channelData,
    )

    return ResponseUtil.ok({
      order,
      result,
    })
  }

  /**
   * WeChat payment notify
   */
  @ApiOperation({ summary: 'WeChat payment notify' })
  @Post('wechat-notify')
  async wechatNotify() {
    // todo
  }
}

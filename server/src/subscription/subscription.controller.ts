import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  UseGuards,
  Req,
} from '@nestjs/common'
import { SubscriptionService } from './subscription.service'
import { CreateSubscriptionDto } from './dto/create-subscription.dto'
import { UpgradeSubscriptionDto } from './dto/upgrade-subscription.dto'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard'
import { IRequest } from 'src/utils/interface'
import { ResponseUtil } from 'src/utils/response'
import { BundleService } from 'src/region/bundle.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { ApplicationService } from 'src/application/application.service'
import { RegionService } from 'src/region/region.service'
import { ApplicationAuthGuard } from 'src/auth/application.auth.guard'
import { RenewSubscriptionDto } from './dto/renew-subscription.dto'
import * as assert from 'assert'
import { SubscriptionState } from '@prisma/client'
import { AccountService } from 'src/account/account.service'

@ApiTags('Subscription')
@Controller('subscriptions')
@ApiBearerAuth('Authorization')
export class SubscriptionController {
  private readonly logger = new Logger(SubscriptionController.name)

  constructor(
    private readonly subscriptService: SubscriptionService,
    private readonly applicationService: ApplicationService,
    private readonly bundleService: BundleService,
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly accountService: AccountService,
  ) {}

  /**
   * Create a new subscription
   */
  @ApiOperation({ summary: 'Create a new subscription' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateSubscriptionDto, @Req() req: IRequest) {
    const user = req.user

    // check regionId exists
    const region = await this.regionService.findOneDesensitized(dto.regionId)
    if (!region) {
      return ResponseUtil.error(`region ${dto.regionId} not found`)
    }

    // check runtimeId exists
    const runtime = await this.prisma.runtime.findUnique({
      where: { id: dto.runtimeId },
    })
    if (!runtime) {
      return ResponseUtil.error(`runtime ${dto.runtimeId} not found`)
    }

    // check bundleId exists
    const bundle = await this.bundleService.findOne(dto.bundleId, region.id)
    if (!bundle) {
      return ResponseUtil.error(`bundle ${dto.bundleId} not found`)
    }

    // check app count limit
    const LIMIT_COUNT = bundle.limitCountPerUser || 0
    const count = await this.prisma.subscription.count({
      where: {
        createdBy: user.id,
        bundleId: dto.bundleId,
        state: { not: SubscriptionState.Deleted },
      },
    })
    if (count >= LIMIT_COUNT) {
      return ResponseUtil.error(
        `application count limit is ${LIMIT_COUNT} for bundle ${bundle.name}`,
      )
    }

    // check duration supported
    const option = this.bundleService.getSubscriptionOption(
      bundle,
      dto.duration,
    )
    if (!option) {
      return ResponseUtil.error(`duration not supported in bundle`)
    }

    // check account balance
    const account = await this.accountService.findOne(user.id)
    const balance = account?.balance || 0
    const priceAmount = option.specialPrice
    if (balance < priceAmount) {
      return ResponseUtil.error(
        `account balance is not enough, need ${priceAmount} but only ${account.balance}`,
      )
    }

    // create subscription
    const appid = await this.applicationService.tryGenerateUniqueAppid()
    const subscription = await this.subscriptService.create(
      user.id,
      appid,
      dto,
      option,
    )
    return ResponseUtil.ok(subscription)
  }

  /**
   * Get user's subscriptions
   */
  @ApiOperation({ summary: "Get user's subscriptions" })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: IRequest) {
    const user = req.user
    const subscriptions = await this.subscriptService.findAll(user.id)
    return ResponseUtil.ok(subscriptions)
  }

  /**
   * Get subscription by appid
   */
  @ApiOperation({ summary: 'Get subscription by appid' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get(':appid')
  async findOne(@Param('appid') appid: string) {
    const subscription = await this.subscriptService.findOneByAppid(appid)
    if (!subscription) {
      return ResponseUtil.error(`subscription ${appid} not found`)
    }

    return ResponseUtil.ok(subscription)
  }

  /**
   * Renew a subscription
   */
  @ApiOperation({ summary: 'Renew a subscription' })
  @UseGuards(JwtAuthGuard)
  @Post(':id/renewal')
  async renew(
    @Param('id') id: string,
    @Body() dto: RenewSubscriptionDto,
    @Req() req: IRequest,
  ) {
    const { duration } = dto

    // get subscription
    const user = req.user
    const subscription = await this.subscriptService.findOne(user.id, id)
    if (!subscription) {
      return ResponseUtil.error(`subscription ${id} not found`)
    }

    const app = subscription.application
    const bundle = await this.bundleService.findOne(
      subscription.bundleId,
      app.regionId,
    )
    assert(bundle, `bundle ${subscription.bundleId} not found`)

    const option = this.bundleService.getSubscriptionOption(bundle, duration)
    if (!option) {
      return ResponseUtil.error(`duration not supported in bundle`)
    }
    const priceAmount = option.specialPrice

    // check max renewal time
    const MAX_RENEWAL_AT = Date.now() + bundle.maxRenewalTime * 1000
    const newExpiredAt = subscription.expiredAt.getTime() + duration * 1000
    if (newExpiredAt > MAX_RENEWAL_AT) {
      const dateStr = new Date(MAX_RENEWAL_AT).toLocaleString()
      return ResponseUtil.error(
        `max renewal time is ${dateStr} for bundle ${bundle.name}`,
      )
    }

    // check account balance
    const account = await this.accountService.findOne(user.id)
    const balance = account?.balance || 0
    if (balance < priceAmount) {
      return ResponseUtil.error(
        `account balance is not enough, need ${priceAmount} but only ${account.balance}`,
      )
    }

    // renew subscription
    const res = await this.subscriptService.renew(subscription, option)
    return ResponseUtil.ok(res)
  }

  /**
   * TODO: Upgrade a subscription
   */
  @ApiOperation({ summary: 'Upgrade a subscription - TODO' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id/upgrade')
  async upgrade(
    @Param('id') id: string,
    @Body() dto: UpgradeSubscriptionDto,
    @Req() req: IRequest,
  ) {
    const { targetBundleId, restart } = dto

    // get subscription
    const user = req.user
    const subscription = await this.subscriptService.findOne(user.id, id)
    if (!subscription) {
      return ResponseUtil.error(`subscription ${id} not found`)
    }

    // get target bundle
    const app = subscription.application
    const targetBundle = await this.bundleService.findOne(
      targetBundleId,
      app.regionId,
    )
    if (!targetBundle) {
      return ResponseUtil.error(`bundle ${targetBundleId} not found`)
    }

    // check bundle is upgradeable
    const bundle = await this.bundleService.findOne(
      subscription.bundleId,
      app.regionId,
    )
    assert(bundle, `bundle ${subscription.bundleId} not found`)

    if (bundle.id === targetBundle.id) {
      return ResponseUtil.error(`bundle is the same`)
    }

    // check if target bundle limit count is reached
    const LIMIT_COUNT = targetBundle.limitCountPerUser || 0
    const count = await this.prisma.subscription.count({
      where: {
        createdBy: user.id,
        bundleId: targetBundle.id,
        state: { not: SubscriptionState.Deleted },
      },
    })
    if (count >= LIMIT_COUNT) {
      return ResponseUtil.error(
        `application count limit is ${LIMIT_COUNT} for bundle ${targetBundle.name}`,
      )
    }

    return ResponseUtil.error(`not implemented`)
  }

  /**
   * Delete a subscription
   * @param id
   * @returns
   */
  @ApiOperation({ summary: 'Delete a subscription' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: IRequest) {
    const userid = req.user.id
    const res = await this.subscriptService.remove(userid, id)
    return ResponseUtil.ok(res)
  }
}

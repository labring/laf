import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Logger,
} from '@nestjs/common'
import { TriggerService } from './trigger.service'
import { CreateTriggerDto } from './dto/create-trigger.dto'
import { ResponseUtil } from 'src/utils/response'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { BundleService } from 'src/application/bundle.service'
import { ObjectId } from 'mongodb'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { ApplicationAuthGuard } from 'src/authentication/application.auth.guard'
import { FunctionService } from 'src/function/function.service'

@ApiTags('Trigger')
@Controller('apps/:appid/triggers')
@ApiBearerAuth('Authorization')
export class TriggerController {
  private readonly logger = new Logger(TriggerController.name)
  constructor(
    private readonly triggerService: TriggerService,
    private readonly bundleService: BundleService,
    private readonly funcService: FunctionService,
  ) {}

  /**
   * Create a cron trigger
   * @param appid
   * @param dto
   * @returns
   */
  @ApiOperation({ summary: 'Create a cron trigger' })
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Post()
  async create(@Param('appid') appid: string, @Body() dto: CreateTriggerDto) {
    // check trigger count limit
    const bundle = await this.bundleService.findOne(appid)
    const LIMIT_COUNT = bundle?.resource?.limitCountOfTrigger || 0
    const count = await this.triggerService.count(appid)
    if (count >= LIMIT_COUNT) {
      return ResponseUtil.error('Trigger count limit exceeded')
    }

    // check cron expression
    const valid = this.triggerService.isValidCronExpression(dto.cron)
    if (!valid) {
      return ResponseUtil.error('Invalid cron expression')
    }

    // Check if the target function exists
    const found = await this.funcService.findOne(appid, dto.target)
    if (!found) {
      return ResponseUtil.error("Target function doesn't exist")
    }

    const res = await this.triggerService.create(appid, dto)
    return ResponseUtil.ok(res)
  }

  /**
   * Get trigger list of an application
   * @param appid
   * @returns
   */
  @ApiOperation({ summary: 'Get trigger list of an application' })
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get()
  async findAll(@Param('appid') appid: string) {
    const res = await this.triggerService.findAll(appid)
    return ResponseUtil.ok(res)
  }

  /**
   * Delete a cron trigger
   * @param appid
   * @param id
   * @returns
   * @memberof TriggerController
   */
  @ApiOperation({ summary: 'Remove a cron trigger' })
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Param('appid') appid: string) {
    // check if trigger exists
    const trigger = await this.triggerService.findOne(appid, new ObjectId(id))
    if (!trigger) {
      return ResponseUtil.error('Trigger not found')
    }

    const res = await this.triggerService.removeOne(appid, new ObjectId(id))
    return ResponseUtil.ok(res)
  }
}

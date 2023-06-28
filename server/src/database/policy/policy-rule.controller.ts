import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  ApiResponseArray,
  ApiResponseObject,
  ResponseUtil,
} from 'src/utils/response'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { ApplicationAuthGuard } from 'src/authentication/application.auth.guard'
import { CreatePolicyRuleDto } from '../dto/create-rule.dto'
import { PolicyRuleService } from './policy-rule.service'
import { UpdatePolicyRuleDto } from '../dto/update-rule.dto'
import { DatabasePolicyRule } from '../entities/database-policy'

@ApiTags('Database')
@ApiBearerAuth('Authorization')
@Controller('apps/:appid/policies/:name/rules')
export class PolicyRuleController {
  constructor(private readonly ruleService: PolicyRuleService) {}

  @Post()
  @ApiOperation({ summary: 'Create database policy rule' })
  @ApiResponseObject(DatabasePolicyRule)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  async create(
    @Param('appid') appid: string,
    @Param('name') policyName: string,
    @Body() dto: CreatePolicyRuleDto,
  ) {
    // check rule count limit
    const LIMIT_COUNT = 100
    const count = await this.ruleService.count(appid, policyName)
    if (count >= LIMIT_COUNT) {
      return ResponseUtil.error(`rule count limit reached: ${LIMIT_COUNT}`)
    }

    // check if exists
    const exists = await this.ruleService.findOne(
      appid,
      policyName,
      dto.collectionName,
    )
    if (exists) {
      return ResponseUtil.error('rule already exists')
    }

    const doc = await this.ruleService.create(appid, policyName, dto)
    return ResponseUtil.ok(doc)
  }

  @Get()
  @ApiOperation({ summary: 'Get database policy rules' })
  @ApiResponseArray(DatabasePolicyRule)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  async findAll(
    @Param('appid') appid: string,
    @Param('name') policyName: string,
  ) {
    const docs = await this.ruleService.findAll(appid, policyName)
    return ResponseUtil.ok(docs)
  }

  @Patch(':collection')
  @ApiOperation({ summary: 'Update database policy rule by collection name' })
  @ApiResponseObject(DatabasePolicyRule)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  async update(
    @Param('appid') appid: string,
    @Param('name') policyName: string,
    @Param('collection') collectionName: string,
    @Body() dto: UpdatePolicyRuleDto,
  ) {
    // check if exists
    const exists = await this.ruleService.findOne(
      appid,
      policyName,
      collectionName,
    )
    if (!exists) {
      return ResponseUtil.error('rule not found')
    }

    const res = await this.ruleService.updateOne(
      appid,
      policyName,
      collectionName,
      dto,
    )
    return ResponseUtil.ok(res)
  }

  @Delete(':collection')
  @ApiOperation({ summary: 'Remove a database policy rule by collection name' })
  @ApiResponseObject(DatabasePolicyRule)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  async remove(
    @Param('appid') appid: string,
    @Param('name') policyName: string,
    @Param('collection') collectionName: string,
  ) {
    // check if exists
    const exists = await this.ruleService.findOne(
      appid,
      policyName,
      collectionName,
    )
    if (!exists) {
      return ResponseUtil.error('rule not found')
    }

    const res = await this.ruleService.removeOne(
      appid,
      policyName,
      collectionName,
    )
    return ResponseUtil.ok(res)
  }
}

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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { ResponseUtil } from 'src/utils/response'
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard'
import { ApplicationAuthGuard } from 'src/auth/application.auth.guard'
import { CreatePolicyRuleDto } from '../dto/create-rule.dto'
import { PolicyRuleService } from './policy-rule.service'
import { UpdatePolicyRuleDto } from '../dto/update-rule.dto'

@ApiTags('Database')
@ApiBearerAuth('Authorization')
@Controller('apps/:appid/policies/:name/rules')
export class PolicyRuleController {
  constructor(private readonly ruleService: PolicyRuleService) {}

  @Post()
  @ApiOperation({ summary: 'Create database policy rule' })
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  async create(
    @Param('appid') appid: string,
    @Param('name') policyName: string,
    @Body() dto: CreatePolicyRuleDto,
  ) {
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
  @ApiResponse({ type: ResponseUtil })
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
  @ApiResponse({ type: ResponseUtil })
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

    const res = await this.ruleService.update(
      appid,
      policyName,
      collectionName,
      dto,
    )
    return ResponseUtil.ok(res)
  }

  @Delete(':collection')
  @ApiOperation({ summary: 'Remove a database policy rule by collection name' })
  @ApiResponse({ type: ResponseUtil })
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

    const res = await this.ruleService.remove(appid, policyName, collectionName)
    return ResponseUtil.ok(res)
  }
}

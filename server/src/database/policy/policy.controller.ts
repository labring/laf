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
import { PolicyService } from './policy.service'
import { CreatePolicyDto } from '../dto/create-policy.dto'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UpdatePolicyDto } from '../dto/update-policy.dto'
import {
  ApiResponseArray,
  ApiResponseObject,
  ApiResponseString,
  ResponseUtil,
} from 'src/utils/response'
import { BundleService } from 'src/application/bundle.service'
import {
  DatabasePolicy,
  DatabasePolicyWithRules,
} from '../entities/database-policy'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { ApplicationAuthGuard } from 'src/authentication/application.auth.guard'

@ApiTags('Database')
@ApiBearerAuth('Authorization')
@Controller('apps/:appid/policies')
export class PolicyController {
  constructor(
    private readonly policiesService: PolicyService,
    private readonly bundleService: BundleService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create database policy' })
  @ApiResponseObject(DatabasePolicyWithRules)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  async create(@Param('appid') appid: string, @Body() dto: CreatePolicyDto) {
    // check policy count limit
    const bundle = await this.bundleService.findOne(appid)
    const LIMIT_COUNT = bundle?.resource?.limitCountOfDatabasePolicy || 0
    const count = await this.policiesService.count(appid)
    if (count >= LIMIT_COUNT) {
      return ResponseUtil.error(`policy count limit reached: ${LIMIT_COUNT}`)
    }

    // check name existed
    const existed = await this.policiesService.findOne(appid, dto.name)
    if (existed) {
      return ResponseUtil.error('Policy name existed')
    }
    const doc = await this.policiesService.create(appid, dto)
    return ResponseUtil.ok(doc)
  }

  @Get()
  @ApiOperation({ summary: 'Get database policy list' })
  @ApiResponseArray(DatabasePolicyWithRules)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  async findAll(@Param('appid') appid: string) {
    const docs = await this.policiesService.findAll(appid)
    return ResponseUtil.ok(docs)
  }

  @Patch(':name')
  @ApiOperation({ summary: 'Update database policy' })
  @ApiResponseObject(DatabasePolicy)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  async update(
    @Param('appid') appid: string,
    @Param('name') name: string,
    @Body() dto: UpdatePolicyDto,
  ) {
    // check policy exists
    const existed = await this.policiesService.findOne(appid, name)
    if (!existed) {
      return ResponseUtil.error('Policy not found')
    }
    const res = await this.policiesService.updateOne(appid, name, dto)
    return ResponseUtil.ok(res)
  }

  @Delete(':name')
  @ApiOperation({ summary: 'Remove a database policy' })
  @ApiResponseString()
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  async remove(@Param('appid') appid: string, @Param('name') name: string) {
    // check policy exists
    const existed = await this.policiesService.findOne(appid, name)
    if (!existed) {
      return ResponseUtil.error('Policy not found')
    }

    await this.policiesService.removeOne(appid, name)
    return ResponseUtil.ok('ok')
  }
}

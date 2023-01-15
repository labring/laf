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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { UpdatePolicyDto } from '../dto/update-policy.dto'
import { ResponseUtil } from 'src/utils/response'
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard'
import { ApplicationAuthGuard } from 'src/auth/application.auth.guard'

@ApiTags('Database')
@ApiBearerAuth('Authorization')
@Controller('apps/:appid/policies')
export class PolicyController {
  constructor(private readonly policiesService: PolicyService) {}

  @Post()
  @ApiOperation({ summary: 'Create database policy' })
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  async create(@Param('appid') appid: string, @Body() dto: CreatePolicyDto) {
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
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  async findAll(@Param('appid') appid: string) {
    const docs = await this.policiesService.findAll(appid)
    return ResponseUtil.ok(docs)
  }

  @Patch(':name')
  @ApiOperation({ summary: 'Update database policy' })
  @ApiResponse({ type: ResponseUtil })
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
    const res = await this.policiesService.update(appid, name, dto)
    return ResponseUtil.ok(res)
  }

  @Delete(':name')
  @ApiOperation({ summary: 'Remove a database policy' })
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  async remove(@Param('appid') appid: string, @Param('name') name: string) {
    // check policy exists
    const existed = await this.policiesService.findOne(appid, name)
    if (!existed) {
      return ResponseUtil.error('Policy not found')
    }

    const res = await this.policiesService.remove(appid, name)
    return ResponseUtil.ok(res)
  }
}

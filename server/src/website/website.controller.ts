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
import { WebsiteService } from './website.service'
import { CreateWebsiteDto } from './dto/create-website.dto'
import { BindCustomDomainDto } from './dto/update-website.dto'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard'
import { ApplicationAuthGuard } from 'src/auth/application.auth.guard'
import { ResponseUtil } from 'src/utils/response'

@ApiTags('WebsiteHosting')
@ApiBearerAuth('Authorization')
@Controller('apps/:appid/websites')
export class WebsiteController {
  constructor(private readonly websiteService: WebsiteService) {}

  /**
   * Create a new website
   * @param appid
   * @param dto
   * @param req
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Create a new website' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Post()
  async create(@Param('appid') appid: string, @Body() dto: CreateWebsiteDto) {
    const site = await this.websiteService.create(appid, dto)

    if (!site) {
      return ResponseUtil.error('failed to create website')
    }

    return ResponseUtil.ok(site)
  }

  /**
   * Get all websites of an app
   * @param req
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Get all websites of an app' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get()
  async findAll(@Param('appid') appid: string) {
    const sites = await this.websiteService.findAll(appid)
    return ResponseUtil.ok(sites)
  }

  /**
   * Get a website hosting of an app
   * @param id
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Get a website hosting of an app' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get(':id')
  async findOne(@Param('appid') _appid: string, @Param('id') id: string) {
    const site = await this.websiteService.findOne(id)
    if (!site) {
      return ResponseUtil.error('website hosting not found')
    }

    return ResponseUtil.ok(site)
  }

  /**
   * Bind custom domain to website
   * @param id
   * @param dto
   * @param req
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Bind custom domain to website' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Patch(':id')
  async bindDomain(
    @Param('appid') _appid: string,
    @Param('id') id: string,
    @Body() dto: BindCustomDomainDto,
  ) {
    // get website
    const site = await this.websiteService.findOne(id)
    if (!site) {
      return ResponseUtil.error('website hosting not found')
    }

    // check if domain resolved
    const resolved = await this.websiteService.checkResolved(site, dto.domain)
    if (!resolved) {
      return ResponseUtil.error('domain not resolved')
    }

    // TODO: check if domain is already binded, remove old domain

    // bind domain
    const binded = await this.websiteService.bindCustomDomain(
      site.id,
      dto.domain,
    )
    if (!binded) {
      return ResponseUtil.error('failed to bind domain')
    }

    return ResponseUtil.ok(binded)
  }

  /**
   * Check if domain is resolved
   * @param id
   * @param dto
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Check if domain is resolved' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Post(':id/resolved')
  async checkResolved(
    @Param('appid') _appid: string,
    @Param('id') id: string,
    @Body() dto: BindCustomDomainDto,
  ) {
    // get website
    const site = await this.websiteService.findOne(id)
    if (!site) {
      return ResponseUtil.error('website hosting not found')
    }

    // check if domain resolved
    const resolved = await this.websiteService.checkResolved(site, dto.domain)
    if (!resolved) {
      return ResponseUtil.error('domain not resolved')
    }

    return ResponseUtil.ok(resolved)
  }

  /**
   * Delete a website hosting
   * @param id
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Delete a website hosting' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Delete(':id')
  async remove(@Param('appid') _appid: string, @Param('id') id: string) {
    const site = await this.websiteService.findOne(id)
    if (!site) {
      return ResponseUtil.error('website hosting not found')
    }

    const deleted = await this.websiteService.remove(site.id)
    if (!deleted) {
      return ResponseUtil.error('failed to delete website hosting')
    }

    return ResponseUtil.ok(deleted)
  }
}

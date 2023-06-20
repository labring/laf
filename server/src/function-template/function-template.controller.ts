import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  Req,
  Query,
  Param,
  Put,
} from '@nestjs/common'
import { FunctionTemplateService } from './function-template.service'
import { CreateFunctionTemplateDto } from './dto/create-function-template.dto'
import { UpdateFunctionTemplateDto } from './dto/update-function-template.dto'
// import * as assert from 'node:assert'
import { IRequest } from '../utils/interface'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  ResponseUtil,
  ApiResponseString,
  ApiResponseArray,
  ApiResponsePagination,
} from 'src/utils/response'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { ObjectId } from 'mongodb'
import { FunctionService } from 'src/function/function.service'
import { BundleService } from 'src/application/bundle.service'
import { DependencyService } from 'src/dependency/dependency.service'
import {
  FunctionTemplateSwagger,
  GetFunctionTemplateUsedByItemSwagger,
} from './entities/swagger-help'

@ApiTags('FunctionTemplate')
@ApiBearerAuth('Authorization')
@Controller('function-templates')
export class FunctionTemplateController {
  constructor(
    private readonly functionsService: FunctionService,
    private readonly bundleService: BundleService,
    private readonly dependencyService: DependencyService,
    private readonly functionTemplateService: FunctionTemplateService,
  ) {}

  /**
   * Create a new function-template
   * @param dto
   * @returns
   */
  @ApiOperation({ summary: 'create a function template' })
  @ApiResponseArray(FunctionTemplateSwagger)
  @UseGuards(JwtAuthGuard)
  @Post()
  async createFunctionTemplate(
    @Body() dto: CreateFunctionTemplateDto,
    @Req() req: IRequest,
  ) {
    // validate dependencies
    const valid = dto.dependencies.every((dep) =>
      this.dependencyService.validate(dep),
    )
    if (!valid) {
      return ResponseUtil.error('function template dependencies is invalid')
    }
    const res = await this.functionTemplateService.createFunctionTemplate(
      req.user._id,
      dto,
    )
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'use a function template' })
  @ApiResponseArray(FunctionTemplateSwagger)
  @UseGuards(JwtAuthGuard)
  @Post(':templateId/:appid')
  async useFunctionTemplate(
    @Param('templateId') templateId: string,
    @Param('appid') appid: string,
    @Req() req: IRequest,
  ) {
    if (templateId.length != 24) {
      return ResponseUtil.error('invalid templateId')
    }
    // Check if appid is a valid resource
    const valid = await this.functionTemplateService.applicationAuthGuard(
      appid,
      req.user._id,
    )

    if (!valid) {
      return ResponseUtil.error('invalid resource')
    }

    // check if the function template is exist
    const found = await this.functionTemplateService.findOneFunctionTemplate(
      new ObjectId(templateId),
    )
    if (!found) {
      return ResponseUtil.error('function template not found')
    }

    // function check
    const functionTemplateItems =
      await this.functionTemplateService.findFunctionTemplateItems(
        new ObjectId(templateId),
      )
    if (functionTemplateItems.length === 0 || !functionTemplateItems) {
      return ResponseUtil.error('function template items not found')
    }

    // check if meet the count limit
    const bundle = await this.bundleService.findOne(appid)
    const MAX_FUNCTION_COUNT = bundle?.resource?.limitCountOfCloudFunction || 0
    const count = await this.functionsService.count(appid)
    if (count >= MAX_FUNCTION_COUNT) {
      return ResponseUtil.error('exceed the count limit')
    }

    const res = await this.functionTemplateService.useFunctionTemplate(
      req.user._id,
      appid,
      new ObjectId(templateId),
    )

    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'update a function template' })
  @ApiResponseArray(FunctionTemplateSwagger)
  @UseGuards(JwtAuthGuard)
  @Patch('update/:id')
  async updateFunctionTemplate(
    @Param('id') templateId: string,
    @Body() dto: UpdateFunctionTemplateDto,
    @Req() req: IRequest,
  ) {
    if (templateId.length != 24) {
      return ResponseUtil.error('invalid templateId')
    }

    // check if the function template is exist
    const found = await this.functionTemplateService.findOneFunctionTemplate(
      new ObjectId(templateId),
      req.user._id,
    )
    if (!found) {
      return ResponseUtil.error('function template not found')
    }

    const res = await this.functionTemplateService.updateFunctionTemplate(
      req.user._id,
      new ObjectId(templateId),
      dto,
    )

    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'delete a function template' })
  @ApiResponseArray(FunctionTemplateSwagger)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteFunctionTemplate(
    @Param('id') templateId: string,
    @Req() req: IRequest,
  ) {
    if (templateId.length != 24) {
      return ResponseUtil.error('invalid templateId')
    }

    const found = await this.functionTemplateService.findOneFunctionTemplate(
      new ObjectId(templateId),
      req.user._id,
    )
    if (!found) {
      return ResponseUtil.error('function template not found')
    }
    const res = await this.functionTemplateService.deleteFunctionTemplate(
      new ObjectId(templateId),
      req.user._id,
    )
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'star a function template' })
  @ApiResponseString()
  @UseGuards(JwtAuthGuard)
  @Put(':templateId/star')
  async starFunctionTemplate(
    @Param('templateId') templateId: string,
    @Req() req: IRequest,
  ) {
    if (templateId.length != 24) {
      return ResponseUtil.error('invalid templateId')
    }
    const found = await this.functionTemplateService.findOneFunctionTemplate(
      new ObjectId(templateId),
    )
    if (!found) {
      return ResponseUtil.error('function template not found')
    }
    const res = await this.functionTemplateService.starFunctionTemplate(
      new ObjectId(templateId),
      req.user._id,
    )
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'get function template user star state' })
  @ApiResponseString()
  @UseGuards(JwtAuthGuard)
  @Get(':id/star-state')
  async getUserFunctionTemplateStarState(
    @Param('id') templateId: string,
    @Req() req: IRequest,
  ) {
    if (templateId.length != 24) {
      return ResponseUtil.error('invalid templateId')
    }

    const res =
      await this.functionTemplateService.functionTemplateUserStarState(
        new ObjectId(templateId),
        req.user._id,
      )
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'get people who use this function template' })
  @ApiResponsePagination(GetFunctionTemplateUsedByItemSwagger)
  @UseGuards(JwtAuthGuard)
  @Get(':id/used-by')
  async getFunctionTemplateUsedBy(
    @Param('id') templateId: string,
    @Query('asc') asc: number,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    if (templateId.length != 24) {
      return ResponseUtil.error('invalid templateId')
    }

    asc = asc === 0 ? Number(asc) : 1
    page = page ? Number(page) : 1
    pageSize = pageSize ? Number(pageSize) : 10
    const found = await this.functionTemplateService.findOneFunctionTemplate(
      new ObjectId(templateId),
    )
    if (!found) {
      return ResponseUtil.error('function template not found')
    }
    const res = await this.functionTemplateService.functionTemplateUsedBy(
      new ObjectId(templateId),
      asc,
      page,
      pageSize,
    )
    return ResponseUtil.ok(res)
  }

  /**
   * asc default is time
   * type sort asc= sort type
   *
   * @param page
   * @param pageSize
   * @param keyword
   * @param asc
   * @param sort
   * @param type
   * @param req
   * @returns
   */
  @ApiOperation({ summary: 'get my function template' })
  @ApiResponsePagination(FunctionTemplateSwagger)
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyFunctionTemplate(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('keyword') keyword: string,
    @Query('asc') asc: number,
    @Query('sort') sort: string,
    @Query('type') type: string,
    @Req() req: IRequest,
  ) {
    if (type === 'default' && keyword) {
      asc = asc === 0 ? Number(asc) : 1
      page = page ? Number(page) : 1
      pageSize = pageSize ? Number(pageSize) : 10

      const res =
        await this.functionTemplateService.findMyFunctionTemplatesByName(
          asc,
          page,
          pageSize,
          req.user._id,
          keyword,
        )
      return ResponseUtil.ok(res)
    }

    if (type === 'default' && sort === 'hot') {
      asc = asc === 0 ? Number(asc) : 1
      page = page ? Number(page) : 1
      pageSize = pageSize ? Number(pageSize) : 10
      const hot = true

      const res = await this.functionTemplateService.findMyFunctionTemplates(
        asc,
        page,
        pageSize,
        req.user._id,
        hot,
      )
      return ResponseUtil.ok(res)
    }

    if (type === 'default') {
      asc = asc === 0 ? Number(asc) : 1
      page = page ? Number(page) : 1
      pageSize = pageSize ? Number(pageSize) : 10

      const res = await this.functionTemplateService.findMyFunctionTemplates(
        asc,
        page,
        pageSize,
        req.user._id,
      )
      return ResponseUtil.ok(res)
    }

    if (type === 'stared' && keyword) {
      asc = asc === 0 ? Number(asc) : 1
      page = page ? Number(page) : 1
      pageSize = pageSize ? Number(pageSize) : 10

      const condition = {
        asc,
        page,
        pageSize,
        name: keyword,
      }
      const res =
        await this.functionTemplateService.findMyStaredFunctionTemplates(
          req.user._id,
          condition,
        )
      return ResponseUtil.ok(res)
    }

    if (type === 'stared' && sort === 'hot') {
      asc = asc === 0 ? Number(asc) : 1
      page = page ? Number(page) : 1
      pageSize = pageSize ? Number(pageSize) : 10
      const condition = {
        page,
        pageSize,
        asc,
        hot: true,
      }
      const res =
        await this.functionTemplateService.findMyStaredFunctionTemplates(
          req.user._id,
          condition,
        )
      return ResponseUtil.ok(res)
    }

    if (type === 'stared') {
      asc = asc === 0 ? Number(asc) : 1
      page = page ? Number(page) : 1
      pageSize = pageSize ? Number(pageSize) : 10

      const condition = {
        asc,
        page,
        pageSize,
      }
      const res =
        await this.functionTemplateService.findMyStaredFunctionTemplates(
          req.user._id,
          condition,
        )
      return ResponseUtil.ok(res)
    }

    if ((type = 'recentUsed' && keyword)) {
      asc = asc === 0 ? Number(asc) : 1
      page = page ? Number(page) : 1
      pageSize = pageSize ? Number(pageSize) : 10

      const condition = {
        asc,
        page,
        pageSize,
        name: keyword,
      }
      const res =
        await this.functionTemplateService.findMyRecentUseFunctionTemplates(
          req.user._id,
          condition,
        )
      return ResponseUtil.ok(res)
    }

    if (type === 'recentUsed' && sort === 'hot') {
      asc = asc === 0 ? Number(asc) : 1
      page = page ? Number(page) : 1
      pageSize = pageSize ? Number(pageSize) : 10

      const condition = {
        asc,
        page,
        pageSize,
        hot: true,
      }
      const res =
        await this.functionTemplateService.findMyRecentUseFunctionTemplates(
          req.user._id,
          condition,
        )
      return ResponseUtil.ok(res)
    }

    if (type === 'recentUsed') {
      asc = asc === 0 ? Number(asc) : 1
      page = page ? Number(page) : 1
      pageSize = pageSize ? Number(pageSize) : 10

      const condition = {
        asc,
        page,
        pageSize,
      }
      const res =
        await this.functionTemplateService.findMyRecentUseFunctionTemplates(
          req.user._id,
          condition,
        )
      return ResponseUtil.ok(res)
    }
  }

  @ApiOperation({ summary: 'get one function template' })
  @ApiResponseArray(FunctionTemplateSwagger)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOneFunctionTemplate(
    @Param('id') templateId: string,
    @Req() req: IRequest,
  ) {
    if (templateId.length !== 24) {
      return ResponseUtil.error('function template id is invalid')
    }

    const template = await this.functionTemplateService.findOneFunctionTemplate(
      new ObjectId(templateId),
    )

    if (
      template.private === true &&
      template.uid.toString() !== req.user._id.toString()
    ) {
      return ResponseUtil.error(
        'private function template can only be inspect by the owner',
      )
    }

    const res = await this.functionTemplateService.findOne(
      new ObjectId(templateId),
    )

    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'get all function template' })
  @ApiResponsePagination(FunctionTemplateSwagger)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllFunctionTemplate(
    @Query('asc') asc: number,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('keyword') keyword: string,
    @Query('sort') sort: string,
  ) {
    if (keyword) {
      asc = asc === 0 ? Number(asc) : 1
      page = page ? Number(page) : 1
      pageSize = pageSize ? Number(pageSize) : 10

      const res =
        await this.functionTemplateService.findFunctionTemplatesByName(
          asc,
          page,
          pageSize,
          keyword,
        )
      return ResponseUtil.ok(res)
    }

    if (sort === 'hot') {
      asc = asc === 0 ? Number(asc) : 1
      page = page ? Number(page) : 1
      pageSize = pageSize ? Number(pageSize) : 10

      const hot = true
      const res = await this.functionTemplateService.findFunctionTemplates(
        asc,
        page,
        pageSize,
        hot,
      )
      return ResponseUtil.ok(res)
    }

    asc = asc === 0 ? Number(asc) : 1
    page = page ? Number(page) : 1
    pageSize = pageSize ? Number(pageSize) : 10

    const res = await this.functionTemplateService.findFunctionTemplates(
      asc,
      page,
      pageSize,
    )

    return ResponseUtil.ok(res)
  }
}

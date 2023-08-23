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
import { GetFunctionTemplateUsedByDto } from './dto/function-template-usedBy.dto'
import { FunctionTemplatesDto } from './dto/function-templates.dto'

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
  @ApiResponseArray(FunctionTemplatesDto)
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

    const counts =
      await this.functionTemplateService.getCountOfFunctionTemplates(
        req.user._id,
      )

    if (counts >= 100) {
      return ResponseUtil.error('function template exceed the count limit')
    }

    const res = await this.functionTemplateService.createFunctionTemplate(
      req.user._id,
      dto,
    )
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'use a function template' })
  @ApiResponseArray(FunctionTemplatesDto)
  @UseGuards(JwtAuthGuard)
  @Post(':templateId/:appid')
  async useFunctionTemplate(
    @Param('templateId') templateId: string,
    @Param('appid') appid: string,
    @Req() req: IRequest,
  ) {
    if (templateId.length !== 24) {
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
    if (!functionTemplateItems || functionTemplateItems.length === 0) {
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
  @ApiResponseArray(FunctionTemplatesDto)
  @UseGuards(JwtAuthGuard)
  @Patch('update/:id')
  async updateFunctionTemplate(
    @Param('id') templateId: string,
    @Body() dto: UpdateFunctionTemplateDto,
    @Req() req: IRequest,
  ) {
    if (templateId.length !== 24) {
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
  @ApiResponseArray(FunctionTemplatesDto)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteFunctionTemplate(
    @Param('id') templateId: string,
    @Req() req: IRequest,
  ) {
    if (templateId.length !== 24) {
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
    if (templateId.length !== 24) {
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
    if (templateId.length !== 24) {
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
  @ApiResponsePagination(GetFunctionTemplateUsedByDto)
  @UseGuards(JwtAuthGuard)
  @Get(':id/used-by')
  async getFunctionTemplateUsedBy(
    @Param('id') templateId: string,
    @Query('asc') asc: number,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    if (templateId.length !== 24) {
      return ResponseUtil.error('invalid templateId')
    }

    asc = asc === 0 ? Number(asc) : 1
    page = page ? Number(page) : 1
    pageSize = pageSize ? Number(pageSize) : 10
    if (pageSize > 100) {
      pageSize = 100
    }
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
   * asc is sorted by time by default
   * If sort has a value, then asc's sort type is the type of sort's value
   * For example, if the value of sort is hot, then asc's sort is the star field
   */
  @ApiOperation({ summary: 'get my function template' })
  @ApiResponsePagination(FunctionTemplatesDto)
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
    asc = asc === 0 ? Number(asc) : 1
    page = page ? Number(page) : 1
    pageSize = pageSize ? Number(pageSize) : 10
    if (pageSize > 100) {
      pageSize = 100
    }

    if (type === 'default' && keyword) {
      const condition = {
        asc,
        page,
        pageSize,
        name: keyword,
      }
      const res = await this.functionTemplateService.findMyFunctionTemplates(
        req.user._id,
        condition,
      )
      return ResponseUtil.ok(res)
    }

    if (type === 'default' && sort === 'hot') {
      const condition = {
        page,
        pageSize,
        asc,
        hot: true,
      }
      const res = await this.functionTemplateService.findMyFunctionTemplates(
        req.user._id,
        condition,
      )
      return ResponseUtil.ok(res)
    }

    if (type === 'default') {
      const condition = {
        asc,
        page,
        pageSize,
      }
      const res = await this.functionTemplateService.findMyFunctionTemplates(
        req.user._id,
        condition,
      )
      return ResponseUtil.ok(res)
    }

    /**
     * stared function template
     */
    if (type === 'stared' && keyword) {
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

    /**
     * recent used function template
     */
    if (type === 'recentUsed' && keyword) {
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

  @ApiOperation({ summary: 'get all recommend function template' })
  @ApiResponsePagination(FunctionTemplatesDto)
  @UseGuards(JwtAuthGuard)
  @Get('recommend')
  async getRecommendFunctionTemplate(
    @Query('asc') asc: number,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('keyword') keyword: string,
    @Query('sort') sort: string,
    @Req() req: IRequest,
  ) {
    asc = asc === 0 ? Number(asc) : 1
    page = page ? Number(page) : 1
    pageSize = pageSize ? Number(pageSize) : 10
    if (pageSize > 100) {
      pageSize = 100
    }

    const condition = {
      page,
      pageSize,
      asc,
      hot: sort === 'hot',
      name: keyword,
    }

    const res =
      await this.functionTemplateService.findRecommendFunctionTemplates(
        req.user._id,
        condition,
      )

    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'get one function template' })
  @ApiResponseArray(FunctionTemplatesDto)
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
  @ApiResponsePagination(FunctionTemplatesDto)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllFunctionTemplate(
    @Query('asc') asc: number,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('keyword') keyword: string,
    @Query('sort') sort: string,
    @Req() req: IRequest,
  ) {
    asc = asc === 0 ? Number(asc) : 1
    page = page ? Number(page) : 1
    pageSize = pageSize ? Number(pageSize) : 10
    if (pageSize > 100) {
      pageSize = 100
    }
    if (keyword) {
      const res =
        await this.functionTemplateService.findFunctionTemplatesByName(
          asc,
          page,
          pageSize,
          keyword,
          req.user._id,
        )
      return ResponseUtil.ok(res)
    }

    const res = await this.functionTemplateService.findFunctionTemplates(
      asc,
      page,
      pageSize,
      req.user._id,
      sort,
    )

    return ResponseUtil.ok(res)
  }
}

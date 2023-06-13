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
} from '@nestjs/common'
import { FunctionTemplateService } from './function-template.service'
import { CreateFunctionTemplateDto } from './dto/create-function-template.dto'
import { StarFunctionTemplateDto } from './dto/star-function-template.dto'
import { UseFunctionTemplateDto } from './dto/use-function-template.dto'
import { UpdateFunctionTemplateDto } from './dto/update-function-template.dto'
import * as assert from 'node:assert'
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
  GetMyStaredFunctionTemplateSwagger,
  GetMyRecentUseFunctionTemplateSwagger,
} from './entities/swagger-help'

@ApiTags('FunctionTemplate')
@ApiBearerAuth('Authorization')
@Controller('function-template')
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
  @Post('create')
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
  @Post('use')
  async useFunctionTemplate(
    @Body() dto: UseFunctionTemplateDto,
    @Req() req: IRequest,
  ) {
    dto.functionTemplateId = new ObjectId(dto.functionTemplateId)

    // Check if appid is a valid resource
    const valid = await this.functionTemplateService.applicationAuthGuard(
      dto.appid,
      req.user._id,
    )

    if (!valid) {
      return ResponseUtil.error('invalid resource')
    }

    // check if the function template is exist
    const found = await this.functionTemplateService.findOneFunctionTemplate(
      dto.functionTemplateId,
    )
    if (!found) {
      return ResponseUtil.error('function template not found')
    }

    // function check
    const functionTemplateItems =
      await this.functionTemplateService.findFunctionTemplateItems(
        dto.functionTemplateId,
      )
    if (functionTemplateItems.length === 0 || !functionTemplateItems) {
      return ResponseUtil.error('function template items not found')
    }

    for (const functionTemplateItem of functionTemplateItems) {
      // check name is unique
      const found = await this.functionsService.findOne(
        dto.appid,
        functionTemplateItem.name,
      )
      if (found) {
        return ResponseUtil.error('function name is not unique')
      }
      // check if meet the count limit
      const bundle = await this.bundleService.findOne(dto.appid)
      const MAX_FUNCTION_COUNT =
        bundle?.resource?.limitCountOfCloudFunction || 0
      const count = await this.functionsService.count(dto.appid)
      if (count >= MAX_FUNCTION_COUNT) {
        return ResponseUtil.error('exceed the count limit')
      }
    }

    const res = await this.functionTemplateService.useFunctionTemplate(
      req.user._id,
      dto.appid,
      dto,
    )

    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'update a function template' })
  @ApiResponseArray(FunctionTemplateSwagger)
  @UseGuards(JwtAuthGuard)
  @Patch('update')
  async updateFunctionTemplate(
    @Body() dto: UpdateFunctionTemplateDto,
    @Req() req: IRequest,
  ) {
    dto.functionTemplateId = new ObjectId(dto.functionTemplateId)

    // check if the function template is exist
    const found = await this.functionTemplateService.findOneFunctionTemplate(
      dto.functionTemplateId,
      req.user._id,
    )
    if (!found) {
      return ResponseUtil.error('function template not found')
    }

    const res = await this.functionTemplateService.updateFunctionTemplate(
      req.user._id,
      dto.functionTemplateId,
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
  @Post('star')
  async starFunctionTemplate(
    @Body() dto: StarFunctionTemplateDto,
    @Req() req: IRequest,
  ) {
    dto.functionTemplateId = new ObjectId(dto.functionTemplateId)
    const found = await this.functionTemplateService.findOneFunctionTemplate(
      dto.functionTemplateId,
    )
    if (!found) {
      return ResponseUtil.error('function template not found')
    }
    const res = await this.functionTemplateService.starFunctionTemplate(
      dto.functionTemplateId,
      req.user._id,
    )
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'get function template user star state' })
  @ApiResponseString()
  @UseGuards(JwtAuthGuard)
  @Get('star/:id')
  async getUserFunctionTemplateStarState(
    @Param('id') templateId: string,
    @Req() req: IRequest,
  ) {
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
  @Get('used-by/:id')
  async getFunctionTemplateUsedBy(
    @Param('id') templateId: string,
    @Query('recent') recent: number,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    recent = recent === 0 ? Number(recent) : 1
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
      recent,
      page,
      pageSize,
    )
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'get one function template' })
  @ApiResponseArray(FunctionTemplateSwagger)
  @UseGuards(JwtAuthGuard)
  @Get('one/:id')
  async getOneFunctionTemplate(
    @Param('id') templateId: string,
    @Req() req: IRequest,
  ) {
    const template = await this.functionTemplateService.findOneFunctionTemplate(
      new ObjectId(templateId),
    )

    try {
      assert(
        template.private === false ||
          template.uid.toString() === req.user._id.toString(),
        'private function template can only be inspect by the owner',
      )
    } catch (error) {
      return ResponseUtil.error(error.message)
    }

    const res = await this.functionTemplateService.findOne(
      new ObjectId(templateId),
    )

    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'get all function template' })
  @ApiResponsePagination(FunctionTemplateSwagger)
  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getAllFunctionTemplate(
    @Query('recent') recent: number,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('name') name: string,
    @Query('starAsc') starAsc: number,
    @Query('hot') hot: boolean,
  ) {
    if (name) {
      recent = recent === 0 ? Number(recent) : 1
      page = page ? Number(page) : 1
      pageSize = pageSize ? Number(pageSize) : 10

      const res =
        await this.functionTemplateService.findFunctionTemplatesByName(
          recent,
          page,
          pageSize,
          name,
        )
      return ResponseUtil.ok(res)
    }
    if (hot) {
      starAsc = starAsc === 0 ? Number(starAsc) : 1
      page = page ? Number(page) : 1
      pageSize = pageSize ? Number(pageSize) : 10

      const res =
        await this.functionTemplateService.findMostStarFunctionTemplates(
          starAsc,
          page,
          pageSize,
        )
      return ResponseUtil.ok(res)
    }
    recent = recent === 0 ? Number(recent) : 1
    page = page ? Number(page) : 1
    pageSize = pageSize ? Number(pageSize) : 10

    const res = await this.functionTemplateService.findFunctionTemplates(
      recent,
      page,
      pageSize,
    )

    return ResponseUtil.ok(res)
  }

  // @ApiOperation({ summary: 'get all function template' })
  // @ApiResponsePagination(FunctionTemplateSwagger)
  // @UseGuards(JwtAuthGuard)
  // @Get('all-byname')
  // async getAllFunctionTemplateByName(
  //   @Query('recent') recent: number,
  //   @Query('page') page: number,
  //   @Query('pageSize') pageSize: number,
  //   @Query('name') name: string,
  // ) {
  //   recent = recent === 0 ? Number(recent) : 1
  //   page = page ? Number(page) : 1
  //   pageSize = pageSize ? Number(pageSize) : 10

  //   const res = await this.functionTemplateService.findFunctionTemplatesByName(
  //     recent,
  //     page,
  //     pageSize,
  //     name,
  //   )
  //   return ResponseUtil.ok(res)
  // }

  // @ApiOperation({ summary: 'get most star function template' })
  // @ApiResponsePagination(FunctionTemplateSwagger)
  // @UseGuards(JwtAuthGuard)
  // @Get('hot')
  // async getHotFunctionTemplate(
  //   @Query('starAsc') starAsc: number,
  //   @Query('page') page: number,
  //   @Query('pageSize') pageSize: number,
  // ) {
  //   starAsc = starAsc === 0 ? Number(starAsc) : 1
  //   page = page ? Number(page) : 1
  //   pageSize = pageSize ? Number(pageSize) : 10

  //   const res =
  //     await this.functionTemplateService.findMostStarFunctionTemplates(
  //       starAsc,
  //       page,
  //       pageSize,
  //     )
  //   return ResponseUtil.ok(res)
  // }

  // @ApiOperation({ summary: 'get my most star function template' })
  // @ApiResponsePagination(FunctionTemplateSwagger)
  // @UseGuards(JwtAuthGuard)
  // @Get('my-hot')
  // async getMyHotFunctionTemplate(
  //   @Query('starAsc') starAsc: number,
  //   @Query('page') page: number,
  //   @Query('pageSize') pageSize: number,
  //   @Req() req: IRequest,
  // ) {
  //   starAsc = starAsc === 0 ? Number(starAsc) : 1
  //   page = page ? Number(page) : 1
  //   pageSize = pageSize ? Number(pageSize) : 10

  //   const res =
  //     await this.functionTemplateService.findMyMostStarFunctionTemplates(
  //       starAsc,
  //       page,
  //       pageSize,
  //       req.user._id,
  //     )
  //   return ResponseUtil.ok(res)
  // }

  @ApiOperation({ summary: 'get my template function' })
  @ApiResponsePagination(FunctionTemplateSwagger)
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyFunctionTemplate(
    @Query('recent') recent: number,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('name') name: string,
    @Query('starName') starName: string,
    @Query('stared') stared: boolean,
    @Query('recentUsed') recentUsed: boolean,
    @Query('hot') hot: boolean,
    @Query('starAsc') starAsc: number,
    @Req() req: IRequest,
  ) {
    if (name) {
      recent = recent === 0 ? Number(recent) : 1
      page = page ? Number(page) : 1
      pageSize = pageSize ? Number(pageSize) : 10

      const res =
        await this.functionTemplateService.findMyFunctionTemplatesByName(
          recent,
          page,
          pageSize,
          req.user._id,
          name,
        )
      return ResponseUtil.ok(res)
    }

    if (starName) {
      recent = recent === 0 ? Number(recent) : 1
      page = page ? Number(page) : 1
      pageSize = pageSize ? Number(pageSize) : 10

      const res =
        await this.functionTemplateService.findMyStaredFunctionTemplates(
          recent,
          page,
          pageSize,
          req.user._id,
          starName,
        )
      return ResponseUtil.ok(res)
    }

    if (stared) {
      recent = recent === 0 ? Number(recent) : 1
      page = page ? Number(page) : 1
      pageSize = pageSize ? Number(pageSize) : 10

      const res =
        await this.functionTemplateService.findMyStaredFunctionTemplates(
          recent,
          page,
          pageSize,
          req.user._id,
        )
      return ResponseUtil.ok(res)
    }

    if (recentUsed) {
      recent = recent === 0 ? Number(recent) : 1
      page = page ? Number(page) : 1
      pageSize = pageSize ? Number(pageSize) : 10

      const res =
        await this.functionTemplateService.findMyRecentUseFunctionTemplates(
          recent,
          page,
          pageSize,
          req.user._id,
        )
      return ResponseUtil.ok(res)
    }

    if (hot) {
      starAsc = starAsc === 0 ? Number(starAsc) : 1
      page = page ? Number(page) : 1
      pageSize = pageSize ? Number(pageSize) : 10

      const res =
        await this.functionTemplateService.findMyMostStarFunctionTemplates(
          starAsc,
          page,
          pageSize,
          req.user._id,
        )
      return ResponseUtil.ok(res)
    }

    recent = recent === 0 ? Number(recent) : 1
    page = page ? Number(page) : 1
    pageSize = pageSize ? Number(pageSize) : 10

    const res = await this.functionTemplateService.findMyFunctionTemplates(
      recent,
      page,
      pageSize,
      req.user._id,
    )
    return ResponseUtil.ok(res)
  }

  // @ApiOperation({ summary: 'get my template function by name' })
  // @ApiResponsePagination(FunctionTemplateSwagger)
  // @UseGuards(JwtAuthGuard)
  // @Get('my-byname')
  // async getMyFunctionTemplateByName(
  //   @Query('recent') recent: number,
  //   @Query('page') page: number,
  //   @Query('pageSize') pageSize: number,
  //   @Query('name') name: string,
  //   @Req() req: IRequest,
  // ) {
  //   recent = recent === 0 ? Number(recent) : 1
  //   page = page ? Number(page) : 1
  //   pageSize = pageSize ? Number(pageSize) : 10

  //   const res =
  //     await this.functionTemplateService.findMyFunctionTemplatesByName(
  //       recent,
  //       page,
  //       pageSize,
  //       req.user._id,
  //       name,
  //     )
  //   return ResponseUtil.ok(res)
  // }

  // @ApiOperation({ summary: 'get my star function template' })
  // @ApiResponsePagination(FunctionTemplateSwagger)
  // @UseGuards(JwtAuthGuard)
  // @Get('my-star')
  // async getMyStaredFunctionTemplate(
  //   @Query('recent') recent: number,
  //   @Query('page') page: number,
  //   @Query('pageSize') pageSize: number,
  //   @Req() req: IRequest,
  // ) {
  //   recent = recent === 0 ? Number(recent) : 1
  //   page = page ? Number(page) : 1
  //   pageSize = pageSize ? Number(pageSize) : 10

  //   const res =
  //     await this.functionTemplateService.findMyStaredFunctionTemplates(
  //       recent,
  //       page,
  //       pageSize,
  //       req.user._id,
  //     )
  //   return ResponseUtil.ok(res)
  // }

  // @ApiOperation({ summary: 'get my recent used function template' })
  // @ApiResponsePagination(FunctionTemplateSwagger)
  // @UseGuards(JwtAuthGuard)
  // @Get('my-recent')
  // async getMyRecentUseFunctionTemplate(
  //   @Query('recent') recent: number,
  //   @Query('page') page: number,
  //   @Query('pageSize') pageSize: number,
  //   @Req() req: IRequest,
  // ) {
  //   recent = recent === 0 ? Number(recent) : 1
  //   page = page ? Number(page) : 1
  //   pageSize = pageSize ? Number(pageSize) : 10

  //   const res =
  //     await this.functionTemplateService.findMyRecentUseFunctionTemplates(
  //       recent,
  //       page,
  //       pageSize,
  //       req.user._id,
  //     )
  //   return ResponseUtil.ok(res)
  // }
}

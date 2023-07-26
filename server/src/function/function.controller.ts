import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common'
import { CreateFunctionDto } from './dto/create-function.dto'
import { UpdateFunctionDto } from './dto/update-function.dto'
import {
  ApiResponseArray,
  ApiResponseObject,
  ResponseUtil,
} from '../utils/response'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { FunctionService } from './function.service'
import { IRequest } from '../utils/interface'
import { CompileFunctionDto } from './dto/compile-function.dto'
import { BundleService } from 'src/application/bundle.service'
import { I18n, I18nContext, I18nService } from 'nestjs-i18n'
import { I18nTranslations } from '../generated/i18n.generated'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { ApplicationAuthGuard } from 'src/authentication/application.auth.guard'
import { CloudFunctionHistory } from './entities/cloud-function-history'
import { CloudFunction } from './entities/cloud-function'
import { UpdateFunctionDebugDto } from './dto/update-function-debug.dto'
import { FunctionRecycleBinService } from 'src/recycle-bin/cloud-function/function-recycle-bin.service'
import { STORAGE_LIMIT } from 'src/constants'

@ApiTags('Function')
@ApiBearerAuth('Authorization')
@Controller('apps/:appid/functions')
export class FunctionController {
  constructor(
    private readonly functionsService: FunctionService,
    private readonly bundleService: BundleService,
    private readonly functionRecycleBinService: FunctionRecycleBinService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  /**
   * Create a new function
   * @param dto
   * @returns
   */
  @ApiResponseObject(CloudFunction)
  @ApiOperation({ summary: 'Create a new function' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Post()
  async create(
    @Param('appid') appid: string,
    @Body() dto: CreateFunctionDto,
    @Req() req: IRequest,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    const error = dto.validate()
    if (error) {
      return ResponseUtil.error(error)
    }

    // check name is unique
    const found = await this.functionsService.findOne(appid, dto.name)
    if (found) {
      return ResponseUtil.error(
        i18n.t('function.create.nameExist', { args: { name: dto.name } }),
      )
    }

    // check if meet the count limit
    const bundle = await this.bundleService.findOne(appid)
    const MAX_FUNCTION_COUNT = bundle?.resource?.limitCountOfCloudFunction || 0
    const count = await this.functionsService.count(appid)
    if (count >= MAX_FUNCTION_COUNT) {
      return ResponseUtil.error(
        i18n.t('function.create.maxCount', {
          args: { count: MAX_FUNCTION_COUNT },
        }),
      )
    }

    const res = await this.functionsService.create(appid, req.user._id, dto)
    if (!res) {
      return ResponseUtil.error(i18n.t('function.create.error'))
    }
    return ResponseUtil.ok(res)
  }

  /**
   * Query function list of an app
   * @returns
   */
  @ApiResponseArray(CloudFunction)
  @ApiOperation({ summary: 'Query function list of an app' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get()
  async findAll(@Param('appid') appid: string) {
    const data = await this.functionsService.findAll(appid)
    return ResponseUtil.ok(data)
  }

  /**
   * Get a function by its name
   * @param appid
   * @param name
   */
  @ApiResponseObject(CloudFunction)
  @ApiOperation({ summary: 'Get a function by its name' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get(':name')
  async findOne(
    @Param('appid') appid: string,
    @Param('name') name: string,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    const data = await this.functionsService.findOne(appid, name)
    if (!data) {
      throw new HttpException(
        i18n.t('function.common.notFound', { args: { name } }),
        HttpStatus.NOT_FOUND,
      )
    }
    return ResponseUtil.ok(data)
  }

  /**
   * Update function debug info
   * @param appid
   * @param name
   * @param dto
   * @returns
   */
  @ApiResponseObject(CloudFunction)
  @ApiOperation({ summary: 'Update function debug info' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Patch(':name/debug/params')
  async updateDebug(
    @Param('appid') appid: string,
    @Param('name') name: string,
    @Body() dto: UpdateFunctionDebugDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    const func = await this.functionsService.findOne(appid, name)
    if (!func) {
      throw new HttpException(
        i18n.t('function.common.notFound', { args: { name } }),
        HttpStatus.NOT_FOUND,
      )
    }

    const res = await this.functionsService.updateOneDebug(func, dto)
    if (!res) {
      return ResponseUtil.error(i18n.t('function.update.error'))
    }
    return ResponseUtil.ok(res)
  }

  /**
   * Update a function
   * @param appid
   * @param name
   * @param dto
   * @returns
   */
  @ApiResponseObject(CloudFunction)
  @ApiOperation({ summary: 'Update a function' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Patch(':name')
  async update(
    @Param('appid') appid: string,
    @Param('name') name: string,
    @Body() dto: UpdateFunctionDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    const func = await this.functionsService.findOne(appid, name)
    if (!func) {
      throw new HttpException(
        i18n.t('function.common.notFound', { args: { name } }),
        HttpStatus.NOT_FOUND,
      )
    }
    const res = await this.functionsService.updateOne(func, dto)
    if (!res) {
      return ResponseUtil.error(i18n.t('function.update.error'))
    }
    if (res instanceof Error) {
      return ResponseUtil.error(res.message)
    }

    return ResponseUtil.ok(res)
  }

  /**
   * Delete a function
   * @param appid
   * @param name
   * @returns
   */
  @ApiResponseObject(CloudFunction)
  @ApiOperation({ summary: 'Delete a function' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Delete(':name')
  async remove(
    @Param('appid') appid: string,
    @Param('name') name: string,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    const func = await this.functionsService.findOne(appid, name)
    if (!func) {
      throw new HttpException(
        i18n.t('function.common.notFound', { args: { name } }),
        HttpStatus.NOT_FOUND,
      )
    }
    const recycleBinStorage =
      await this.functionRecycleBinService.getRecycleBinStorage(appid)

    if (recycleBinStorage >= STORAGE_LIMIT) {
      return ResponseUtil.error('Recycle bin is full, please free up space')
    }

    const res = await this.functionsService.removeOne(func)
    if (!res) {
      return ResponseUtil.error(i18n.t('function.delete.error'))
    }
    return ResponseUtil.ok(res)
  }

  /**
   * Compile a function
   * @param appid
   * @param name
   * @returns
   */
  @ApiResponseObject(CloudFunction)
  @ApiOperation({ summary: 'Compile a function ' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Post(':name/compile')
  async compile(
    @Param('appid') appid: string,
    @Param('name') name: string,
    @Body() dto: CompileFunctionDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    if (!dto.code) {
      return ResponseUtil.error(i18n.t('function.compile.codeRequired'))
    }

    const func = await this.functionsService.findOne(appid, name)
    if (!func) {
      throw new HttpException(
        i18n.t('function.common.notFound', { args: { name } }),
        HttpStatus.NOT_FOUND,
      )
    }

    const res = await this.functionsService.compile(func, dto)
    return ResponseUtil.ok(res)
  }

  /**
   * Get function history
   */
  @ApiResponseArray(CloudFunctionHistory)
  @ApiOperation({ summary: 'Get cloud function history' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get(':name/history')
  async getHistory(
    @Param('appid') appid: string,
    @Param('name') name: string,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    const func = await this.functionsService.findOne(appid, name)
    if (!func) {
      throw new HttpException(
        i18n.t('function.common.notFound', { args: { name } }),
        HttpStatus.NOT_FOUND,
      )
    }

    const res = await this.functionsService.getHistory(func)
    return ResponseUtil.ok(res)
  }
}

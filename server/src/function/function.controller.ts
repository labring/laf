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
import { ResponseUtil } from '../utils/response'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt.auth.guard'
import { ApplicationAuthGuard } from '../auth/application.auth.guard'
import { FunctionService } from './function.service'
import { IRequest } from '../utils/interface'
import { CompileFunctionDto } from './dto/compile-function.dto'
import { MAX_FUNCTION_COUNT } from 'src/constants'

@ApiTags('Function')
@ApiBearerAuth('Authorization')
@Controller('apps/:appid/functions')
export class FunctionController {
  constructor(private readonly functionsService: FunctionService) {}

  /**
   * Create a new function
   * @param dto
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Create a new function' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Post()
  async create(
    @Param('appid') appid: string,
    @Body() dto: CreateFunctionDto,
    @Req() req: IRequest,
  ) {
    const error = dto.validate()
    if (error) {
      return ResponseUtil.error(error)
    }

    // check name is unique
    const found = await this.functionsService.findOne(appid, dto.name)
    if (found) {
      return ResponseUtil.error('function name is already existed')
    }

    // check if meet the count limit
    const count = await this.functionsService.count(appid)
    if (count > MAX_FUNCTION_COUNT) {
      return ResponseUtil.error(`function count limit is ${MAX_FUNCTION_COUNT}`)
    }

    const res = await this.functionsService.create(appid, req.user.id, dto)
    if (!res) {
      return ResponseUtil.error('create function error')
    }
    return ResponseUtil.ok(res)
  }

  /**
   * Query function list of an app
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
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
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Get a function by its name' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get(':name')
  async findOne(@Param('appid') appid: string, @Param('name') name: string) {
    const data = await this.functionsService.findOne(appid, name)
    if (!data) {
      throw new HttpException('function not found', HttpStatus.NOT_FOUND)
    }
    return ResponseUtil.ok(data)
  }

  /**
   * Update a function
   * @param appid
   * @param name
   * @param dto
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Update a function' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Patch(':name')
  async update(
    @Param('appid') appid: string,
    @Param('name') name: string,
    @Body() dto: UpdateFunctionDto,
  ) {
    const func = await this.functionsService.findOne(appid, name)
    if (!func) {
      throw new HttpException('function not found', HttpStatus.NOT_FOUND)
    }

    const res = await this.functionsService.update(func, dto)
    if (!res) {
      return ResponseUtil.error('update function error')
    }
    return ResponseUtil.ok(res)
  }

  /**
   * Delete a function
   * @param appid
   * @param name
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Delete a function' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Delete(':name')
  async remove(@Param('appid') appid: string, @Param('name') name: string) {
    const func = await this.functionsService.findOne(appid, name)
    if (!func) {
      throw new HttpException('function not found', HttpStatus.NOT_FOUND)
    }

    const res = await this.functionsService.remove(func)
    if (!res) {
      return ResponseUtil.error('delete function error')
    }
    return ResponseUtil.ok(res)
  }

  /**
   * Compile a function
   * @param appid
   * @param name
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Compile a function ' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Post(':name/compile')
  async compile(
    @Param('appid') appid: string,
    @Param('name') name: string,
    @Body() dto: CompileFunctionDto,
  ) {
    if (!dto.code) {
      return ResponseUtil.error('code is required')
    }

    const func = await this.functionsService.findOne(appid, name)
    if (!func) {
      throw new HttpException('function not found', HttpStatus.NOT_FOUND)
    }

    const res = await this.functionsService.compile(func, dto)
    return ResponseUtil.ok(res)
  }
}

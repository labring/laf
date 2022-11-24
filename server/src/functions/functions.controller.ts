import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common'
import { FunctionsService } from './functions.service'
import { CreateFunctionDto } from './dto/create-function.dto'
import { UpdateFunctionDto } from './dto/update-function.dto'
import { ApiResponseUtil, ResponseUtil } from 'src/common/response'
import { CloudFunction, CloudFunctionList } from './entities/function.entity'
import { ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { ApplicationAuthGuard } from 'src/applications/application.auth.guard'
import { IRequest } from 'src/common/types'

@ApiTags('Functions')
@Controller('apps/:appid/functions')
export class FunctionsController {
  constructor(private readonly functionsService: FunctionsService) {}

  @ApiResponseUtil(CloudFunction)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Post()
  async create(@Body() dto: CreateFunctionDto, @Req() req: IRequest) {
    const error = dto.validate()
    if (error) {
      return ResponseUtil.error(error)
    }

    const appid = req.application.appid
    const res = await this.functionsService.create(appid, dto)
    if (!res) {
      return ResponseUtil.error('create function error')
    }
    return ResponseUtil.ok(res)
  }

  @ApiResponseUtil(CloudFunctionList)
  @Get()
  findAll() {
    return this.functionsService.findAll()
  }

  @ApiResponseUtil(CloudFunction)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.functionsService.findOne(+id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFunctionDto: UpdateFunctionDto,
  ) {
    return this.functionsService.update(+id, updateFunctionDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.functionsService.remove(+id)
  }
}

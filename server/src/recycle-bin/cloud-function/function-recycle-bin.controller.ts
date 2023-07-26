import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common'
import {
  ApiResponseObject,
  ApiResponsePagination,
  ResponseUtil,
} from 'src/utils/response'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { ApplicationAuthGuard } from 'src/authentication/application.auth.guard'
import { ObjectId } from 'mongodb'
import { FunctionRecycleBinService } from './function-recycle-bin.service'
import { DeleteRecycleBinItemsDto } from './dto/delete-recycle-bin-functions.dto'
import { RestoreRecycleBinItemsDto } from './dto/restore-recycle-bin-functions.dto'
import { FunctionRecycleBinItemsDto } from './dto/get-recycle-bin-functions.dto'
import { CloudFunctionRecycleBinQuery } from './interface/function-recycle-bin-query.interface'

@ApiTags('RecycleBin')
@ApiBearerAuth('Authorization')
@Controller('recycle-bin/:appid/functions')
export class FunctionRecycleBinController {
  constructor(
    private readonly functionRecycleBinService: FunctionRecycleBinService,
  ) {}

  /**
   * Delete function Recycle bin items
   */
  @ApiOperation({ summary: 'Delete function Recycle bin items' })
  @ApiResponseObject(Number)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Post('delete')
  async deleteRecycleBinItems(
    @Param('appid') appid: string,
    @Body() dto: DeleteRecycleBinItemsDto,
  ) {
    const ids = dto.ids.map((id) => new ObjectId(id))
    const res = await this.functionRecycleBinService.deleteFromRecycleBin(
      appid,
      ids,
    )
    if (!res.acknowledged) {
      return ResponseUtil.error('empty recycle bin items failed')
    }
    return ResponseUtil.ok(res.deletedCount)
  }

  @ApiOperation({ summary: 'Empty function Recycle bin items' })
  @ApiResponseObject(Number)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Delete()
  async emptyRecycleBin(@Param('appid') appid: string) {
    const res = await this.functionRecycleBinService.emptyRecycleBin(appid)
    if (!res.acknowledged) {
      return ResponseUtil.error('Empty function Recycle bin failed')
    }
    return ResponseUtil.ok(res.deletedCount)
  }

  /**
   * Restore function Recycle bin items
   */
  @ApiOperation({ summary: 'restore function Recycle bin items' })
  @ApiResponseObject(Number)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Post('restore')
  async restoreRecycleBinItems(
    @Param('appid') appid: string,
    @Body() dto: RestoreRecycleBinItemsDto,
  ) {
    const ids = dto.ids.map((id) => new ObjectId(id))
    const res =
      await this.functionRecycleBinService.restoreDeletedCloudFunctions(
        appid,
        ids,
      )
    if (!res.acknowledged) {
      return ResponseUtil.error('restore function recycle items failed')
    }
    return ResponseUtil.ok(res.insertedCount)
  }

  @ApiOperation({ summary: 'Get cloud function recycle bin' })
  @ApiResponsePagination(FunctionRecycleBinItemsDto)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get()
  async getRecycleBin(
    @Param('appid') appid: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('startTime') startTime?: number,
    @Query('endTime') endTime?: number,
  ) {
    const query: CloudFunctionRecycleBinQuery = {
      page: page || 1,
      pageSize: pageSize || 12,
    }
    if (query.pageSize > 100) {
      query.pageSize = 100
    }
    if (startTime) {
      query.startTime = new Date(startTime)
    }
    if (endTime) {
      query.endTime = new Date(endTime)
    }
    if (keyword) {
      query.name = keyword
    }
    const res = await this.functionRecycleBinService.getRecycleBin(appid, query)
    return ResponseUtil.ok(res)
  }
}

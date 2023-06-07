import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { ResponseUtil } from 'src/utils/response'
import { IRequest } from 'src/utils/interface'
import { CreatePATDto } from './dto/create-pat.dto'
import { PatService } from './pat.service'
import { ObjectId } from 'mongodb'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'

@ApiTags('Authentication')
@ApiBearerAuth('Authorization')
@Controller('pats')
export class PatController {
  private readonly logger = new Logger(PatController.name)

  constructor(private readonly patService: PatService) {}

  /**
   * Create a PAT
   * @param req
   * @param dto
   * @returns
   */
  @ApiOperation({ summary: 'Create a PAT' })
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: IRequest, @Body() dto: CreatePATDto) {
    const uid = req.user._id
    // check max count, 10
    const count = await this.patService.count(uid)
    if (count >= 10) {
      return ResponseUtil.error('Max count of PAT is 10')
    }

    const pat = await this.patService.create(uid, dto)
    return ResponseUtil.ok(pat)
  }

  /**
   * List PATs
   * @param req
   * @returns
   */
  @ApiOperation({ summary: 'List PATs' })
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: IRequest) {
    const uid = req.user._id
    const pats = await this.patService.findAll(uid)
    return ResponseUtil.ok(pats)
  }

  /**
   * Delete a PAT
   * @param req
   * @param id
   * @returns
   */
  @ApiOperation({ summary: 'Delete a PAT' })
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Req() req: IRequest, @Param('id') id: string) {
    const uid = req.user._id
    const pat = await this.patService.removeOne(uid, new ObjectId(id))
    return ResponseUtil.ok(pat)
  }
}

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
  Res,
} from '@nestjs/common'
import { User } from '@prisma/client'
import { Request, Response } from 'express'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ResponseUtil } from '../utils/response'
import { ApplicationsService } from './applications.service'
import { CreateApplicationDto } from './dto/create-application.dto'
import { UpdateApplicationDto } from './dto/update-application.dto'

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly appService: ApplicationsService) {}

  /**
   * Create application
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateApplicationDto, @Req() req: Request) {
    const user = req.user as User
    const error = dto.validate()
    if (error) {
      return ResponseUtil.error(error)
    }

    // create namespace
    const appid = this.appService.generateAppid(6)
    const namespace = await this.appService.createAppNamespace(user.id, appid)
    if (!namespace) {
      return ResponseUtil.error('create app namespace error')
    }

    // create app
    const app = await this.appService.create(user.id, appid, dto)
    if (!app) {
      return ResponseUtil.error('create app error')
    }
    return ResponseUtil.ok(app)
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: Request) {
    const user = req.user as User
    const data = this.appService.findAllByUser(user.id)
    return ResponseUtil.ok(data)
  }

  @UseGuards(JwtAuthGuard)
  @Get(':appid')
  findOne(
    @Param('appid') appid: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = req.user as User
    const data = this.appService.findOne(user.id, appid)
    if (null === data) {
      return res.status(404).send('Application not found with appid: ' + appid)
    }
    return ResponseUtil.ok(data)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    return this.appService.update(+id, updateApplicationDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appService.remove(+id)
  }
}

import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiResponsePagination, ResponseUtil } from 'src/utils/response'
import { NotificationService } from './notification.service'
import { InjectUser } from 'src/utils/decorator'
import { User } from 'src/user/entities/user'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { ApiOperation } from '@nestjs/swagger'
import { Notification } from './entities/notification'

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({ summary: 'Get notification list' })
  @ApiResponsePagination(Notification)
  @UseGuards(JwtAuthGuard)
  @Get('list')
  async findAll(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @InjectUser() user: User,
  ) {
    page = page ? Number(page) : 1
    pageSize = pageSize ? Number(pageSize) : 10

    const res = await this.notificationService.findAll(user, page, pageSize)

    return ResponseUtil.ok(res)
  }
}

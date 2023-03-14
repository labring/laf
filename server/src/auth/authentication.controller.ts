import { AuthenticationService } from './authentication.service'
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ResponseUtil } from 'src/utils/response'
import { JwtAuthGuard } from './jwt.auth.guard'
import { BindUsernameDto } from './dto/bind-username.dto'
import { IRequest } from 'src/utils/interface'
import { BindPhoneDto } from './dto/bind-phone.dto'
import { SmsService } from './phone/sms.service'
import { SmsVerifyCodeType } from '@prisma/client'
import { UserService } from 'src/user/user.service'

@ApiTags('Authentication - New')
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly smsService: SmsService,
    private readonly userService: UserService,
  ) {}

  /**
   * Auth providers
   */
  @ApiOperation({ summary: 'Auth providers' })
  @ApiResponse({ type: ResponseUtil })
  @Get('providers')
  async getProviders() {
    const providers = await this.authenticationService.getProviders()
    return ResponseUtil.ok(providers)
  }

  /**
   * Bind phone
   */
  @ApiOperation({ summary: 'Bind username' })
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard)
  @Post('bind/phone')
  async bindPhone(@Body() dto: BindPhoneDto, @Req() req: IRequest) {
    const { phone, code } = dto
    // check code valid
    const err = await this.smsService.validCode(
      phone,
      code,
      SmsVerifyCodeType.Bind,
    )
    if (err) {
      return ResponseUtil.error(err)
    }

    // check phone if have already been bound
    const user = await this.userService.find(phone)
    if (user) {
      return ResponseUtil.error('phone already been bound')
    }

    // bind phone
    await this.userService.updateUser({
      where: {
        id: req.user.id,
      },
      data: {
        phone,
      },
    })
  }

  /**
   * Bind username, not support bind existed username
   */
  @ApiOperation({ summary: 'Bind username' })
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard)
  @Post('bind/username')
  async bindUsername(@Body() dto: BindUsernameDto, @Req() req: IRequest) {
    const { username, phone, code } = dto

    // check code valid
    const err = await this.smsService.validCode(
      phone,
      code,
      SmsVerifyCodeType.Bind,
    )
    if (err) {
      return ResponseUtil.error(err)
    }

    // check username if have already been bound
    const user = await this.userService.find(username)
    if (user) {
      return ResponseUtil.error('username already been bound')
    }

    // bind username
    await this.userService.updateUser({
      where: {
        id: req.user.id,
      },
      data: {
        username,
      },
    })
  }
}

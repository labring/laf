import { SmsService } from 'src/auth/phone/sms.service'
import { SmsVerifyCodeType } from '@prisma/client'
import { IRequest } from 'src/utils/interface'
import { Body, Controller, Logger, Post, Req } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ResponseUtil } from 'src/utils/response'
import { SendPhoneCodeDto } from '../dto/send-phone-code.dto'
import { PhoneService } from './phone.service'
import { PhoneSigninDto } from '../dto/phone-signin.dto'
import { AuthenticationService } from '../authentication.service'
import { UserService } from 'src/user/user.service'

@ApiTags('Authentication - New')
@Controller('auth')
export class PhoneController {
  private readonly logger = new Logger(PhoneController.name)

  constructor(
    private readonly phoneService: PhoneService,
    private readonly smsService: SmsService,
    private readonly authService: AuthenticationService,
    private readonly userService: UserService,
  ) {}

  /**
   * send phone code by username and password
   */
  @ApiOperation({ summary: 'Send phone verify code' })
  @ApiResponse({ type: ResponseUtil })
  @Post('phone/sms/code')
  async sendPhoneCode(@Req() req: IRequest, @Body() dto: SendPhoneCodeDto) {
    const { phone, type } = dto
    const ip = req.headers['x-real-ip'] as string

    const err = await this.phoneService.sendPhoneCode(phone, type, ip)
    if (err) {
      return ResponseUtil.error(err)
    }
    return ResponseUtil.ok('success')
  }

  /**
   * Signin by phone and verify code
   */
  @ApiOperation({ summary: 'Signin by phone and verify code' })
  @ApiResponse({ type: ResponseUtil })
  @Post('phone/signin')
  async signin(@Body() dto: PhoneSigninDto) {
    const { phone, code } = dto
    // check if code valid
    const err = await this.smsService.validCode(
      phone,
      code,
      SmsVerifyCodeType.Signin,
    )
    if (err) return ResponseUtil.error(err)

    // check if user exists
    const user = await this.userService.user({ phone })
    if (user) {
      const data = this.phoneService.signin(user)
      return ResponseUtil.ok(data)
    }

    // user not exist, check if register is allowed
    // get phone auth provider info
    const provider = await this.authService.getProvider('phone')
    if (provider.register === false) {
      return ResponseUtil.error('register is not allowed')
    }

    // user not exist, signup and signin
    const newUser = await this.phoneService.signup(dto)
    const data = this.phoneService.signin(newUser)
    return ResponseUtil.ok(data)
  }
}

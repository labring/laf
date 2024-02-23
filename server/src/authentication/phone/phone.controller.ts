import { IRequest } from 'src/utils/interface'
import { Body, Controller, Logger, Post, Req } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ResponseUtil } from 'src/utils/response'
import { SendPhoneCodeDto } from '../dto/send-phone-code.dto'
import { PhoneService } from './phone.service'
import { PhoneSigninDto } from '../dto/phone-signin.dto'
import { AuthenticationService } from '../authentication.service'
import { UserService } from 'src/user/user.service'
import { AuthBindingType, AuthProviderBinding } from '../entities/types'
import { SmsVerifyCodeType } from '../entities/sms-verify-code'
import { SmsService } from './sms.service'
import { GetClientIPFromRequest } from 'src/utils/getter'

@ApiTags('Authentication')
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
   * send phone code
   */
  @ApiOperation({ summary: 'Send phone verify code' })
  @ApiResponse({ type: ResponseUtil })
  @Post('phone/sms/code')
  async sendCode(@Req() req: IRequest, @Body() dto: SendPhoneCodeDto) {
    const { phone, type } = dto
    const ip = GetClientIPFromRequest(req)

    const err = await this.phoneService.sendCode(phone, type, ip)
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
    const err = await this.smsService.validateCode(
      phone,
      code,
      SmsVerifyCodeType.Signin,
    )
    if (err) return ResponseUtil.error(err)

    // check if user exists
    const user = await this.userService.findOneByPhone(phone)
    if (user) {
      const token = this.phoneService.signin(user)
      return ResponseUtil.ok(token)
    }

    // user not exist
    const provider = await this.authService.getPhoneProvider()
    if (provider.register === false) {
      return ResponseUtil.error('user not exists')
    }

    // check if username and password is needed
    let signupWithUsername = false
    const bind = provider.bind as any as AuthProviderBinding
    if (bind.username === AuthBindingType.Required) {
      const { username, password } = dto
      signupWithUsername = true
      if (!username || !password) {
        return ResponseUtil.error('username and password is required')
      }
    }

    // user not exist, signup and signin
    const newUser = await this.phoneService.signup(dto, signupWithUsername)
    const data = this.phoneService.signin(newUser)
    return ResponseUtil.ok(data)
  }
}

import { IRequest } from 'src/utils/interface'
import { Body, Controller, Logger, Post, Req } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ResponseUtil } from 'src/utils/response'
import { SendEmailCodeDto } from '../dto/send-email-code.dto'
import { EmailService } from './email.service'
import { GetClientIPFromRequest } from 'src/utils/getter'
import { UserService } from 'src/user/user.service'
import { EmailSigninDto } from '../dto/email-signin.dto'
import { EmailVerifyCodeType } from '../entities/email-verify-code'
import { AuthenticationService } from '../authentication.service'
import { AuthBindingType, AuthProviderBinding } from '../entities/types'

@ApiTags('Authentication')
@Controller('auth')
export class EmailController {
  private readonly logger = new Logger(EmailController.name)

  constructor(
    private readonly emailService: EmailService,
    private readonly authService: AuthenticationService,
    private readonly userService: UserService,
  ) {}

  /**
   * send email code
   */
  @ApiOperation({ summary: 'Send email verify code' })
  @ApiResponse({ type: ResponseUtil })
  @ApiBody({ type: SendEmailCodeDto })
  @Post('email/code')
  async sendCode(@Req() req: IRequest, @Body() dto: SendEmailCodeDto) {
    const { email, type } = dto
    const ip = GetClientIPFromRequest(req)

    const err = await this.emailService.sendCode(email, type, ip)
    if (err) {
      return ResponseUtil.error(err)
    }
    return ResponseUtil.ok('success')
  }

  /**
   * Signin by email and verify code
   */
  @ApiOperation({ summary: 'Signin by email and verify code' })
  @ApiResponse({ type: ResponseUtil })
  @Post('email/signin')
  async signin(@Body() dto: EmailSigninDto) {
    const { email, code } = dto
    // check if code valid
    const err = await this.emailService.validateCode(
      email,
      code,
      EmailVerifyCodeType.Signin,
    )
    if (err) return ResponseUtil.error(err)

    // check if user exists
    const user = await this.userService.findOneByEmail(email)
    if (user) {
      const token = this.emailService.signin(user)
      return ResponseUtil.ok(token)
    }

    // user not exist
    const provider = await this.authService.getEmailProvider()
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
    const newUser = await this.emailService.signup(dto, signupWithUsername)
    const data = this.emailService.signin(newUser)
    return ResponseUtil.ok(data)
  }
}

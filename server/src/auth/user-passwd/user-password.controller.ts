import { AuthenticationService } from '../authentication.service'
import { UserPasswordService } from './user-password.service'
import { Body, Controller, Logger, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ResponseUtil } from 'src/utils/response'
import { UserService } from '../../user/user.service'
import { PasswdSignupDto } from '../dto/passwd-signup.dto'
import { PasswdSigninDto } from '../dto/passwd-signin.dto'
import { AuthBindingType, AuthProviderBinding } from '../types'

@ApiTags('Authentication - New')
@Controller('auth')
export class UserPasswordController {
  private readonly logger = new Logger(UserPasswordService.name)
  constructor(
    private readonly userService: UserService,
    private readonly passwdService: UserPasswordService,
    private readonly authService: AuthenticationService,
  ) {}

  /**
   * Signup by username and password
   */
  @ApiOperation({ summary: 'Signup by user-password' })
  @ApiResponse({ type: ResponseUtil })
  @Post('passwd/signup')
  async signup(@Body() dto: PasswdSignupDto) {
    const { username } = dto
    // check if user exists
    const doc = await this.userService.user({ username })
    if (doc) {
      return ResponseUtil.error('user already exists')
    }

    // get passwd auth provider info
    const provider = await this.authService.getProvider('user-password')

    // check if register is allowed
    if (provider.register === false) {
      return ResponseUtil.error('register is not allowed')
    }

    // valid phone code if needed
    const bind = provider.bind as any as AuthProviderBinding
    if (bind.phone === AuthBindingType.Required) {
      const { phone, code } = dto
      const err = await this.passwdService.validateSignupPhoneCode(phone, code)
      if (err) {
        return ResponseUtil.error(err)
      }
    }

    // signup user
    const user = await this.passwdService.signup(dto)

    const token = this.authService.getAccessTokenByUser(user)
    if (!token) {
      return ResponseUtil.error('failed to get access token')
    }
    return ResponseUtil.ok({ token, user })
  }

  /**
   * Signin by username and password
   */
  @ApiOperation({ summary: 'Signin by user-password' })
  @ApiResponse({ type: ResponseUtil })
  @Post('passwd/signin')
  async signin(@Body() dto: PasswdSigninDto) {
    const res = await this.passwdService.signin(dto)
    if (!res.ok) {
      return ResponseUtil.error(res.msg)
    }
    return ResponseUtil.ok(res)
  }

  /**
   * Reset password
   */
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ type: ResponseUtil })
  @Post('passwd/reset')
  async reset() {
    return ResponseUtil.ok(this.passwdService.reset())
  }
}

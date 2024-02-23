import { AuthenticationService } from '../authentication.service'
import { UserPasswordService } from './user-password.service'
import { Body, Controller, Logger, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ResponseUtil } from 'src/utils/response'
import { UserService } from '../../user/user.service'
import { PasswdSignupDto } from '../dto/passwd-signup.dto'
import { PasswdSigninDto } from '../dto/passwd-signin.dto'
import { AuthBindingType, AuthProviderBinding } from '../entities/types'
import { SmsService } from '../phone/sms.service'
import { PasswdResetDto } from '../dto/passwd-reset.dto'
import { PasswdCheckDto } from '../dto/passwd-check.dto'
import { EmailService } from '../email/email.service'
import { EmailVerifyCodeType } from '../entities/email-verify-code'
import { SmsVerifyCodeType } from '../entities/sms-verify-code'

@ApiTags('Authentication')
@Controller('auth')
export class UserPasswordController {
  private readonly logger = new Logger(UserPasswordService.name)
  constructor(
    private readonly userService: UserService,
    private readonly passwdService: UserPasswordService,
    private readonly authService: AuthenticationService,
    private readonly smsService: SmsService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Signup by username and password
   */
  @ApiOperation({ summary: 'Signup by user-password' })
  @ApiResponse({ type: ResponseUtil })
  @Post('passwd/signup')
  async signup(@Body() dto: PasswdSignupDto) {
    const { username, password, phone, email, inviteCode, code } = dto
    // check if user exists
    const doc = await this.userService.findOneByUsername(username)
    if (doc) {
      return ResponseUtil.error('user already exists')
    }

    // check if register is allowed
    const provider = await this.authService.getPasswdProvider()
    if (provider.register === false) {
      return ResponseUtil.error('register is not allowed')
    }

    // valid phone code if needed
    const bind = provider.bind as any as AuthProviderBinding
    if (bind.phone === AuthBindingType.Required) {
      // valid phone has been binded
      const user = await this.userService.findOneByPhone(phone)
      if (user) {
        return ResponseUtil.error('phone has been binded')
      }
      const err = await this.smsService.validateCode(
        phone,
        code,
        SmsVerifyCodeType.Signup,
      )
      if (err) {
        return ResponseUtil.error(err)
      }
    }

    // valid email code if needed
    if (bind.email === AuthBindingType.Required) {
      // valid email has been binded
      const user = await this.userService.findOneByEmail(email)
      if (user) {
        return ResponseUtil.error('email has been binded')
      }
      const err = await this.emailService.validateCode(
        email,
        code,
        EmailVerifyCodeType.Signup,
      )
      if (err) {
        return ResponseUtil.error(err)
      }
    }

    // signup user
    const user = await this.passwdService.signup(
      username,
      password,
      phone,
      email,
      inviteCode,
    )

    // signin for created user
    const token = this.passwdService.signin(user)
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
    // check if user exists
    const user = await this.userService.findOneByUsernameOrPhoneOrEmail(
      dto.username,
    )
    if (!user) {
      return ResponseUtil.error('user not found')
    }

    // check if password is correct
    const err = await this.passwdService.validatePassword(
      user._id,
      dto.password,
    )
    if (err) {
      return ResponseUtil.error(err)
    }

    // signin for user
    const token = await this.passwdService.signin(user)
    if (!token) {
      return ResponseUtil.error('failed to get access token')
    }
    return ResponseUtil.ok(token)
  }

  /**
   * Reset password
   */
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ type: ResponseUtil })
  @Post('passwd/reset')
  async reset(@Body() dto: PasswdResetDto) {
    // valid phone code
    const { phone, code, email } = dto
    if (!phone && !email) {
      return ResponseUtil.error('phone or email should be provided')
    }

    if (phone) {
      const err = await this.smsService.validateCode(
        phone,
        code,
        SmsVerifyCodeType.ResetPassword,
      )
      if (err) {
        return ResponseUtil.error(err)
      }
    }

    if (email) {
      const err = await this.emailService.validateCode(
        email,
        code,
        EmailVerifyCodeType.ResetPassword,
      )
      if (err) {
        return ResponseUtil.error(err)
      }
    }

    // find user by phone or email
    const user = phone
      ? await this.userService.findOneByPhone(phone)
      : await this.userService.findOneByEmail(email)
    if (!user) {
      return ResponseUtil.error('user not found')
    }

    // reset password
    await this.passwdService.resetPassword(user._id, dto.password)
    return ResponseUtil.ok('success')
  }

  /**
   * Check if user-password is set
   */
  @ApiOperation({ summary: 'Check if user-password is set' })
  @ApiResponse({ type: ResponseUtil })
  @Post('passwd/check')
  async check(@Body() dto: PasswdCheckDto) {
    const { username } = dto
    // check if user exists
    const user = await this.userService.findOneByUsernameOrPhoneOrEmail(
      username,
    )
    if (!user) {
      return ResponseUtil.error('user not found')
    }
    // find if set password
    const hasPasswd = await this.passwdService.hasPassword(user._id)

    return ResponseUtil.ok(hasPasswd)
  }
}

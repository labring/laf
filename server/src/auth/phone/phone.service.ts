import { Injectable, Logger } from '@nestjs/common'
import { SmsVerifyCodeType, User } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { SmsService } from 'src/auth/phone/sms.service'
import { UserService } from 'src/user/user.service'
import { AuthenticationService } from '../authentication.service'

@Injectable()
export class PhoneService {
  private readonly logger = new Logger(PhoneService.name)
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
    private readonly userService: UserService,
    private readonly authService: AuthenticationService,
  ) {}

  /**
   * Send phone verify code
   * @param phone phone number
   * @param type sms type Signin | Signup | ResetPassword
   * @param ip client ip
   * @returns
   */
  async sendPhoneCode(phone: string, type: SmsVerifyCodeType, ip: string) {
    // check if phone number satisfy the send condition
    let err = await this.smsService.checkSendable(phone, ip)
    if (err) {
      return err
    }

    // Send sms code
    const code = Math.floor(Math.random() * 900000 + 100000).toString()
    err = await this.smsService.sendPhoneCode(phone, code)
    if (err) {
      return err
    }

    // Save sms code to database
    await this.smsService.saveSmsCode({ phone, code, ip, type })

    return null
  }

  /**
   * Signup a user by phone
   * @param dto
   * @returns
   */
  async signup(dto) {
    const { phone } = dto
    const user = await this.userService.create({
      phone,
      username: phone,
      profile: {
        create: {
          name: phone,
        },
      },
    })
    return user
  }

  /**
   * signin a user, return token and if bind password
   * @param user user
   * @returns token and if bind password
   */
  async signin(user) {
    const token = this.authService.getAccessTokenByUser(user)

    // check if user has bind password
    const ifBindPassword = await this.ifBindPassword(user)

    return { token, ifBindPassword }
  }

  // check if current user has bind password
  async ifBindPassword(user: User) {
    const count = await this.prisma.userPassword.count({
      where: {
        uid: user.id,
        state: 'Active',
      },
    })

    if (count === 0) {
      return false
    }
    return true
  }
}

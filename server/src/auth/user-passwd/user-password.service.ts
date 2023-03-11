import { SmsService } from './../phone/sms.service'
import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from 'src/prisma/prisma.service'
import { hashPassword } from 'src/utils/crypto'
import { UserService } from '../../user/user.service'
import { PasswdSigninDto } from '../dto/passwd-signin.dto'
import { PasswdSignupDto } from '../dto/passwd-signup.dto'
import { SmsVerifyCodeType } from '@prisma/client'

type SigninResult = {
  ok: boolean
  msg: string
  data?: any
  token?: string
}

@Injectable()
export class UserPasswordService {
  createPasswd(passwd: string) {
    throw new Error('Method not implemented.')
  }
  private readonly logger = new Logger(UserPasswordService.name)
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly smsService: SmsService,
  ) {}

  /**
   * Singup by username and password
   */
  async signup(dto: PasswdSignupDto) {
    const { username, password } = dto

    // start transaction
    const user = await this.prisma.$transaction(async (tx) => {
      // create user
      const user = await tx.user.create({
        data: {
          username,
          phone: dto.phone,
          profile: { create: { name: username } },
        },
      })

      // create password
      await tx.userPassword.create({
        data: {
          uid: user.id,
          password: hashPassword(password),
          state: 'Active',
        },
      })

      return user
    })

    return user
  }

  /**
   * Signin by username and password
   */
  async signin(dto: PasswdSigninDto): Promise<SigninResult> {
    const { username, passwd } = dto
    // check if user exists
    const user = await this.userService.user({ username })
    if (!user) {
      return { ok: false, msg: 'user not exists' }
    }
    this.logger.debug('user: ', user)
    // check if password is correct
    const password = await this.prisma.userPassword.findFirst({
      where: { uid: user.id, state: 'Active' },
    })
    if (!password) {
      return { ok: false, msg: 'password not exists' }
    }

    if (password.password !== hashPassword(passwd)) {
      return { ok: false, msg: 'password incorrect' }
    }

    const token = ''

    return { ok: true, msg: 'ok', data: user, token }
  }

  reset(): any {
    throw new Error('Method not implemented.')
  }

  async validateSignupPhoneCode(phone: string, code: string) {
    return await this.validatePhoneCode(phone, code, 'Signup')
  }

  async validateSigninPhoneCode(phone: string, code: string) {
    return await this.validatePhoneCode(phone, code, 'Signin')
  }

  /**
   * valid phone code
   * @param phone
   * @param code
   */
  async validatePhoneCode(
    phone: string,
    code: string,
    type: SmsVerifyCodeType,
  ) {
    if (!phone || !code) {
      return 'phone or code is empty'
    }
    // check if code is correct
    this.smsService.isCodeValid(phone, code, type)
    return null
  }
}

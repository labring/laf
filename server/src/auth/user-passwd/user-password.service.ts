import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { hashPassword } from 'src/utils/crypto'
import { PasswdSignupDto } from '../dto/passwd-signup.dto'
import { AuthenticationService } from '../authentication.service'
import { User } from '@prisma/client'
import { PasswdResetDto } from '../dto/passwd-reset.dto'

@Injectable()
export class UserPasswordService {
  private readonly logger = new Logger(UserPasswordService.name)
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthenticationService,
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

  // Signin for user, means get access token
  signin(user: User) {
    return this.authService.getAccessTokenByUser(user)
  }

  // valid if password is correct
  async validPasswd(uid: string, passwd: string) {
    const password = await this.prisma.userPassword.findFirst({
      where: { uid, state: 'Active' },
    })
    if (!password) {
      return 'password not exists'
    }

    if (password.password !== hashPassword(passwd)) {
      return 'password incorrect'
    }

    return null
  }

  // reset password
  async resetPasswd(uid: string, passwd: string) {
    // start transaction
    const update = await this.prisma.$transaction(async (tx) => {
      // disable old password
      await tx.userPassword.updateMany({
        where: { uid },
        data: { state: 'Inactive' },
      })

      // create new password
      const np = await tx.userPassword.create({
        data: {
          uid,
          password: hashPassword(passwd),
          state: 'Active',
        },
      })

      return np
    })
    if (!update) {
      return 'reset password failed'
    }

    return null
  }
}

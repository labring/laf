import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { hashPassword } from 'src/utils/crypto'
import { PasswdSignupDto } from '../dto/passwd-signup.dto'
import { AuthenticationService } from '../authentication.service'
import { User } from '@prisma/client'

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

  /**
   * Signin by username and password
   * @returns access token
   */
  signin(user: User) {
    return this.authService.getAccessTokenByUser(user)
  }

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

  reset(): any {
    throw new Error('Method not implemented.')
  }
}

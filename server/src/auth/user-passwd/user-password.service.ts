import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { User } from '@prisma/client'
import { hashPassword } from 'src/utils/crypto'
import { AuthenticationService } from '../authentication.service'
import { UserPasswordState } from '../types'

@Injectable()
export class UserPasswordService {
  private readonly logger = new Logger(UserPasswordService.name)
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthenticationService,
  ) {}

  // Singup by username and password
  async signup(
    username: string,
    password: string,
    phone: string,
    inviteCode: string,
  ) {
    // start transaction
    const user = await this.prisma.$transaction(async (tx) => {
      // create user
      const user = await tx.user.create({
        data: {
          username,
          phone,
          profile: { create: { name: username } },
        },
      })

      // create password
      await tx.userPassword.create({
        data: {
          uid: user.id,
          password: hashPassword(password),
          state: UserPasswordState.Active,
        },
      })

      // create invite relation
      if (inviteCode) {
        const res = await tx.inviteCode.findUnique({
          where: { code: inviteCode },
        })
        if (res) {
          await tx.inviteRelation.create({
            data: {
              invitedBy: res.uid,
              uid: user.id,
              codeId: res.id,
            },
          })
        }
      }

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
    const userPasswd = await this.prisma.userPassword.findFirst({
      where: { uid, state: UserPasswordState.Active },
    })
    if (!userPasswd) {
      return 'password not exists'
    }

    if (userPasswd.password !== hashPassword(passwd)) {
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
        data: { state: UserPasswordState.Inactive },
      })

      // create new password
      const np = await tx.userPassword.create({
        data: {
          uid,
          password: hashPassword(passwd),
          state: UserPasswordState.Active,
        },
      })

      return np
    })
    if (!update) {
      return 'reset password failed'
    }

    return null
  }

  // check if set password
  async hasPasswd(uid: string) {
    const userPasswd = await this.prisma.userPassword.findFirst({
      where: { uid, state: UserPasswordState.Active },
    })
    return userPasswd ? true : false // true means has password
  }
}

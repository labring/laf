import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { CasdoorService } from './casdoor.service'
import { User } from '@prisma/client'
import { UserService } from '../user/user.service'
import { ServerConfig } from '../constants'
import * as assert from 'node:assert'

@Injectable()
export class AuthService {
  logger: Logger = new Logger(AuthService.name)
  constructor(
    private readonly jwtService: JwtService,
    private readonly casdoorService: CasdoorService,
    private readonly userService: UserService,
  ) {}

  /**
   * Get user token by casdoor code:
   * - code is casdoor code
   * - user token is laf server token, NOT casdoor token
   * @param code
   * @returns
   */
  async code2token(code: string): Promise<string> {
    try {
      const casdoorUser = await this.casdoorService.code2user(code)
      if (!casdoorUser) return null

      // Get or create laf user
      assert(casdoorUser.id, 'casdoor user id is empty')
      const profile = await this.userService.getProfileByOpenid(casdoorUser.id)
      let user = profile?.user
      if (!user) {
        user = await this.userService.create({
          username: casdoorUser.username,
          email: casdoorUser.email,
          phone: casdoorUser.phone,
          profile: {
            create: {
              openid: casdoorUser.id,
              name: casdoorUser.displayName,
              avatar: casdoorUser.avatar,
              from: ServerConfig.CASDOOR_CLIENT_ID,
            },
          },
        })
      } else {
        // update it
        user = await this.userService.updateUser({
          where: { id: user.id },
          data: {
            username: casdoorUser.username,
            email: casdoorUser.email,
            phone: casdoorUser.phone,
            profile: {
              update: {
                name: casdoorUser.displayName,
                avatar: casdoorUser.avatar,
              },
            },
          },
        })
      }

      return this.getAccessTokenByUser(user)
    } catch (error) {
      this.logger.error(error)
      return null
    }
  }

  /**
   * Get access token by user
   * @param user
   * @returns
   */
  getAccessTokenByUser(user: User): string {
    const payload = {
      sub: user.id,
    }
    const token = this.jwtService.sign(payload)
    return token
  }

  /**
   * Generate login url
   * @returns
   */
  getSignInUrl(): string {
    return this.casdoorService.getSignInUrl()
  }

  /**
   * Generate register url
   * @returns
   */
  getSignUpUrl(): string {
    return this.casdoorService.getSignUpUrl()
  }
}

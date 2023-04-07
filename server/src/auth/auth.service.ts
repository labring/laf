import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import * as assert from 'node:assert'
import { PatService } from 'src/user/pat.service'

@Injectable()
export class AuthService {
  logger: Logger = new Logger(AuthService.name)
  constructor(
    private readonly jwtService: JwtService,
    private readonly patService: PatService,
  ) {}

  /**
   * Get token by PAT
   * @param user
   * @param token
   * @returns
   */
  async pat2token(token: string): Promise<string> {
    const pat = await this.patService.findOne(token)
    if (!pat) return null

    // check pat expired
    if (pat.expiredAt < new Date()) return null

    return this.getAccessTokenByUser(pat.user)
  }

  /**
   * Get access token by user
   * @param user
   * @returns
   */
  getAccessTokenByUser(user: User): string {
    const payload = { sub: user.id }
    const token = this.jwtService.sign(payload)
    return token
  }
}

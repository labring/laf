import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from 'src/user/entities/user'
import { PatService } from 'src/user/pat.service'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
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
    const pat = await this.patService.findOneByToken(token)
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
    const payload = { sub: user._id.toString() }
    const token = this.jwtService.sign(payload)
    return token
  }
}

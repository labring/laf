import { JwtService } from '@nestjs/jwt'
import { Injectable, Logger } from '@nestjs/common'
import {
  EMAIL_AUTH_PROVIDER_NAME,
  GITHUB_AUTH_PROVIDER_NAME,
  PASSWORD_AUTH_PROVIDER_NAME,
  PHONE_AUTH_PROVIDER_NAME,
} from 'src/constants'
import { SystemDatabase } from 'src/system-database'
import { AuthProvider, AuthProviderState } from './entities/auth-provider'
import { User } from 'src/user/entities/user'
import { PatService } from 'src/user/pat.service'

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name)
  private readonly db = SystemDatabase.db

  constructor(
    private readonly jwtService: JwtService,
    private readonly patService: PatService,
  ) {}

  /**
   * Get all auth provides
   * @returns
   */
  async getProviders() {
    return await this.db
      .collection<AuthProvider>('AuthProvider')
      .find(
        { state: AuthProviderState.Enabled },
        { projection: { _id: 0, config: 0 } },
      )
      .toArray()
  }

  async getPhoneProvider() {
    return await this.getProvider(PHONE_AUTH_PROVIDER_NAME)
  }

  async getPasswdProvider() {
    return await this.getProvider(PASSWORD_AUTH_PROVIDER_NAME)
  }

  async getGithubProvider() {
    return await this.getProvider(GITHUB_AUTH_PROVIDER_NAME)
  }

  async getEmailProvider() {
    return await this.getProvider(EMAIL_AUTH_PROVIDER_NAME)
  }

  // Get auth provider by name
  async getProvider(name: string) {
    return await this.db
      .collection<AuthProvider>('AuthProvider')
      .findOne({ name })
  }

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

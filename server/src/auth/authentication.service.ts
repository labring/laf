import { JwtService } from '@nestjs/jwt'
import { PrismaService } from 'src/prisma/prisma.service'
import { Injectable, Logger } from '@nestjs/common'
import { AuthProviderState, User } from '@prisma/client'
import {
  PASSWORD_AUTH_PROVIDER_NAME,
  PHONE_AUTH_PROVIDER_NAME,
} from 'src/constants'

@Injectable()
export class AuthenticationService {
  logger: Logger = new Logger(AuthenticationService.name)
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Get all auth provides
   * @returns
   */
  async getProviders() {
    return await this.prismaService.authProvider.findMany({
      where: { state: AuthProviderState.Enabled },
      select: {
        id: false,
        name: true,
        bind: true,
        register: true,
        default: true,
        state: true,
        config: false,
      },
    })
  }

  async getPhoneProvider() {
    return await this.getProvider(PHONE_AUTH_PROVIDER_NAME)
  }

  async getPasswdProvider() {
    return await this.getProvider(PASSWORD_AUTH_PROVIDER_NAME)
  }

  // Get auth provider by name
  async getProvider(name: string) {
    return await this.prismaService.authProvider.findUnique({
      where: { name },
    })
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
}

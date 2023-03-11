import { JwtService } from '@nestjs/jwt'
import { PrismaService } from 'src/prisma/prisma.service'
import { Injectable, Logger } from '@nestjs/common'
import { User } from '@prisma/client'

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
      where: { state: 'Enabled' },
      select: {
        id: false,
        name: true,
        type: true,
        bind: true,
        register: true,
        default: true,
        state: true,
        config: false,
      },
    })
  }

  /**
   * Get auth provider by name
   * @param name
   * @returns
   */
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

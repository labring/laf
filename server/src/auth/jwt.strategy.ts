import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ServerConfig } from '../constants'
import { UsersService } from '../users/users.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: ServerConfig.JWT_SECRET,
    })
  }

  /**
   * Turn payload to user object
   * @param payload
   * @returns
   */
  async validate(payload: any) {
    const id = payload.sub
    const user = await this.userService.user({ id }, true)
    return user
  }
}

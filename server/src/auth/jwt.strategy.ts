import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.CASDOOR_PUBLIC_CERT,
    })
  }

  /**
   * Turn payload to user object
   * @param payload
   * @returns
   */
  async validate(payload: any) {
    return {
      id: payload.sub,
      owner: payload.owner,
      username: payload.name,
      displayName: payload.displayName,
      email: payload.email,
      avatar: payload.avatar,
      emailVerified: payload.emailVerified,
      phone: payload.phone,
    }
  }
}

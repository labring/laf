import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ServerConfig } from '../constants'
import { UserService } from '../user/user.service'
import { ObjectId } from 'mongodb'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
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
    const id = new ObjectId(payload.sub as string)
    const user = await this.userService.findOneById(id)
    return user
  }
}

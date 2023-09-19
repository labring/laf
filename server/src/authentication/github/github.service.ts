import { Injectable } from '@nestjs/common'

import { JwtService } from '@nestjs/jwt'
import { UserService } from 'src/user/user.service'
import { User } from 'src/user/entities/user'
import { GITHUB_SIGNIN_TOKEN_VALIDITY } from 'src/constants'

interface GithubProfile {
  gid: number
  name: string
  avatar: string
}

@Injectable()
export class GithubService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async bindGithub(gid: number, user: User) {
    const _user = await this.userService.findOneByGithub(gid)

    if (_user) throw new Error('user has been bound')

    const res = await this.userService.updateUser(user._id, {
      github: gid,
    })

    return res
  }

  signGithubTemporaryToken(githubProfile: GithubProfile) {
    const payload = { sub: githubProfile }
    const token = this.jwtService.sign(payload, {
      expiresIn: GITHUB_SIGNIN_TOKEN_VALIDITY,
    })
    return token
  }

  verifyGithubTemporaryToken(token: string): [boolean, GithubProfile | null] {
    try {
      const payload = this.jwtService.verify(token)
      const githubProfile = payload.sub
      return [true, githubProfile]
    } catch {
      return [false, null]
    }
  }
}

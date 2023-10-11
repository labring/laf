import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Response,
  UseGuards,
} from '@nestjs/common'
import { Octokit } from '@octokit/rest'
import { IResponse } from 'src/utils/interface'
import { createOAuthAppAuth } from '@octokit/auth-oauth-app'
import { AuthenticationService } from '../authentication.service'
import { UserService } from 'src/user/user.service'
import { ApiResponseObject, ResponseUtil } from 'src/utils/response'
import { GithubService } from './github.service'
import { InjectUser } from 'src/utils/decorator'
import { User, UserWithProfile } from 'src/user/entities/user'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { GithubJumpLoginDto } from '../dto/github-jump-login.dto'
import { JwtAuthGuard } from '../jwt.auth.guard'
import { GithubBind } from '../dto/github-bind.dto'
import { GithubSigninDto } from '../dto/github-signin.dto'
import { AuthProviderState } from '../entities/auth-provider'

@ApiTags('Authentication')
@Controller('auth/github')
export class GithubAuthController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly userService: UserService,
    private readonly githubService: GithubService,
  ) {}

  @ApiOperation({ summary: 'Redirect to the login page of github' })
  @Get('jump_login')
  async jumpLogin(
    @Query() dto: GithubJumpLoginDto,
    @Response() res: IResponse,
  ) {
    const provider = await this.authService.getGithubProvider()
    if (provider.state !== AuthProviderState.Enabled) {
      return ResponseUtil.error('github signin not allowed')
    }

    res.redirect(
      `https://github.com/login/oauth/authorize?client_id=${
        provider.config.clientId
      }&redirect_uri=${encodeURIComponent(dto.redirectUri)}`,
    )
  }

  @ApiOperation({ summary: 'Signin by github' })
  @ApiResponse({ type: ResponseUtil })
  @Post('signin')
  async signin(@Body() dto: GithubSigninDto) {
    const provider = await this.authService.getGithubProvider()
    if (provider.state !== AuthProviderState.Enabled) {
      return ResponseUtil.error('github signin not allowed')
    }

    const githubAuth = createOAuthAppAuth({
      clientId: provider.config.clientId,
      clientSecret: provider.config.clientSecret,
      clientType: 'oauth-app',
    })

    let auth
    try {
      auth = await githubAuth({
        type: 'oauth-user',
        code: dto.code,
      })
    } catch (e) {
      console.log(e)
      return ResponseUtil.error(e.message)
    }

    if (!auth) {
      return ResponseUtil.error('github auth failed')
    }

    const octokit = new Octokit({
      auth: auth.token,
    })

    const _profile = await octokit.rest.users.getAuthenticated()
    if (!_profile.data) {
      return ResponseUtil.error('github auth failed')
    }

    const githubProfile = {
      gid: _profile.data.id,
      name: _profile.data.name,
      avatar: _profile.data.avatar_url,
    }

    const user = await this.userService.findOneByGithub(githubProfile.gid)
    if (!user) {
      const token = this.githubService.signGithubTemporaryToken(githubProfile)
      return ResponseUtil.build(token, 'should bind user')
    }

    const token = this.authService.getAccessTokenByUser(user)
    return ResponseUtil.ok(token)
  }

  @ApiOperation({ summary: 'Bind github' })
  @ApiResponseObject(UserWithProfile)
  @UseGuards(JwtAuthGuard)
  @Post('bind')
  async bind(@Body() dto: GithubBind, @InjectUser() user: User) {
    const [ok, githubProfile] = this.githubService.verifyGithubTemporaryToken(
      dto.token,
    )
    if (!ok) {
      return ResponseUtil.error('invalid token')
    }

    if (user.github) {
      return ResponseUtil.error('duplicate bindings to github')
    }

    const _user = await this.userService.findOneByGithub(githubProfile.gid)
    if (_user) return ResponseUtil.error('user has been bound')

    await this.userService.updateUser(user._id, {
      github: githubProfile.gid,
    })

    if (dto.isRegister) {
      await this.userService.updateAvatarUrl(githubProfile.avatar, user._id)
    }

    const res = await this.userService.findOneById(user._id)
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Unbind github' })
  @ApiResponseObject(UserWithProfile)
  @UseGuards(JwtAuthGuard)
  @Post('unbind')
  async unbind(@InjectUser() user: User) {
    if (!user.github) {
      return ResponseUtil.error('not yet bound to github')
    }

    const res = await this.userService.updateUser(user._id, {
      github: null,
    })
    return ResponseUtil.ok(res)
  }
}

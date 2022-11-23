import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { AuthService } from './auth/auth.service'
import { JwtAuthGuard } from './auth/jwt-auth.guard'
import { ResponseUtil } from './common/response'
import { IRequest } from './common/types'
@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Redirect to login page
   */
  @Get('login')
  async getSigninUrl(@Res() res: Response) {
    const url = this.authService.getSignInUrl()
    return res.redirect(url)
  }

  /**
   * Redirect to register page
   * @param res
   * @returns
   */
  @Get('register')
  async getSignupUrl(@Res() res: Response) {
    const url = this.authService.getSignUpUrl()
    return res.redirect(url)
  }

  /**
   * Get user token by auth code
   * @param code
   * @returns
   */
  @Get('code2token')
  async code2token(@Query('code') code: string) {
    const token = await this.authService.code2token(code)
    if (!token) {
      return ResponseUtil.error('invalid code')
    }

    return ResponseUtil.ok(token)
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() request: IRequest) {
    const user = request.user
    return ResponseUtil.ok(user)
  }
}

import { Controller, Get, Query, Res } from '@nestjs/common'
import { Response } from 'express'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  /**
   * Redirect to login page
   */
  @Get('login')
  async getSigninUrl(@Res() res: Response) {
    const url = this.appService.getSignInUrl()
    return res.redirect(url)
  }

  /**
   * Redirect to register page
   * @param res
   * @returns
   */
  @Get('register')
  async getSignupUrl(@Res() res: Response) {
    const url = this.appService.getSignUpUrl()
    return res.redirect(url)
  }

  /**
   * Get user token by auth code
   * @param code
   * @returns
   */
  @Get('code2token')
  async code2token(@Query('code') code: string) {
    const token = await this.appService.code2token(code)
    if (!token) {
      return {
        error: 'invalid code',
      }
    }

    const user = this.appService.getAuthSDK().parseJwtToken(token)
    return {
      access_token: token,
      user: user,
    }
  }
}

import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Response } from 'express'
import { AuthService } from './auth/auth.service'
import { JwtAuthGuard } from './auth/jwt-auth.guard'
import { ApiResponseUtil, ResponseUtil } from './common/response'
import { IRequest } from './common/types'
import { UserDto } from './users/dto/user.response'

@ApiTags('Authentication')
@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Redirect to login page
   */
  @ApiResponse({ status: 302 })
  @ApiOperation({ summary: 'Redirect to login page' })
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
  @ApiResponse({ status: 302 })
  @ApiOperation({ summary: 'Redirect to register page' })
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
  @ApiOperation({ summary: 'Get user token by auth code' })
  @ApiResponse({
    type: ResponseUtil,
  })
  @Get('code2token')
  async code2token(@Query('code') code: string) {
    const token = await this.authService.code2token(code)
    if (!token) {
      return ResponseUtil.error('invalid code')
    }

    return ResponseUtil.ok(token)
  }

  /**
   * Get current user profile
   * @param request
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiResponseUtil(UserDto)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth('Authorization')
  async getProfile(@Req() request: IRequest) {
    const user = request.user
    return ResponseUtil.ok(user)
  }
}

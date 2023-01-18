import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Response } from 'express'
import { ApiResponseUtil, ResponseUtil } from '../utils/response'
import { IRequest } from '../utils/interface'
import { UserDto } from '../user/dto/user.response'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt.auth.guard'
import { Pat2TokenDto } from './dto/pat2token.dto'

@ApiTags('Authentication')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Redirect to login page
   */
  @ApiResponse({ status: 302 })
  @ApiOperation({ summary: 'Redirect to login page' })
  @Get('login')
  async getSigninUrl(@Res() res: Response): Promise<any> {
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
  @ApiResponse({ type: ResponseUtil })
  @Get('code2token')
  async code2token(@Query('code') code: string) {
    const token = await this.authService.code2token(code)
    if (!token) {
      return ResponseUtil.error('invalid code')
    }

    return ResponseUtil.ok(token)
  }

  /**
   * Get user token by PAT
   * @param pat
   * @returns
   */
  @ApiOperation({ summary: 'Get user token by PAT' })
  @ApiResponse({ type: ResponseUtil })
  @Post('pat2token')
  async pat2token(@Body() dto: Pat2TokenDto) {
    const token = await this.authService.pat2token(dto.pat)
    if (!token) {
      return ResponseUtil.error('invalid pat')
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

import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
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

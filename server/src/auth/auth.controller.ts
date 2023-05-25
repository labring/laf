import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  ApiResponseObject,
  ApiResponseString,
  ResponseUtil,
} from '../utils/response'
import { IRequest } from '../utils/interface'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt.auth.guard'
import { Pat2TokenDto } from './dto/pat2token.dto'
import { UserWithProfile } from 'src/user/entities/user'

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
  @ApiResponseString()
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
  @ApiResponseObject(UserWithProfile)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth('Authorization')
  async getProfile(@Req() request: IRequest) {
    const user = request.user
    return ResponseUtil.ok(user)
  }
}

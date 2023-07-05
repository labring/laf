import { AuthenticationService } from './authentication.service'
import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ApiResponseString, ResponseUtil } from 'src/utils/response'

import { Pat2TokenDto } from './dto/pat2token.dto'

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  /**
   * Auth providers
   */
  @ApiOperation({ summary: 'Auth providers' })
  @ApiResponse({ type: ResponseUtil })
  @Get('providers')
  async getProviders() {
    const providers = await this.authService.getProviders()
    return ResponseUtil.ok(providers)
  }

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
}

import { AuthenticationService } from './authentication.service'
import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ResponseUtil } from 'src/utils/response'

@ApiTags('Authentication - New')
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  /**
   * Auth providers
   */
  @ApiOperation({ summary: 'Auth providers' })
  @ApiResponse({ type: ResponseUtil })
  @Get('providers')
  async getProviders() {
    const providers = await this.authenticationService.getProviders()
    return ResponseUtil.ok(providers)
  }
}

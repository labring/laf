import { IRequest } from 'src/utils/interface'
import { Body, Controller, Logger, Post, Req } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ResponseUtil } from 'src/utils/response'
import { SendEmailCodeDto } from '../dto/send-email-code.dto'
import { EmailService } from './email.service'
import { GetClientIPFromRequest } from 'src/utils/getter'

@ApiTags('Authentication')
@Controller('auth')
export class EmailController {
  private readonly logger = new Logger(EmailController.name)

  constructor(private readonly emailService: EmailService) {}

  /**
   * send email code
   */
  @ApiOperation({ summary: 'Send email verify code' })
  @ApiResponse({ type: ResponseUtil })
  @ApiBody({ type: SendEmailCodeDto })
  @Post('email/code')
  async sendCode(@Req() req: IRequest, @Body() dto: SendEmailCodeDto) {
    const { email, type } = dto
    const ip = GetClientIPFromRequest(req)

    const err = await this.emailService.sendCode(email, type, ip)
    if (err) {
      return ResponseUtil.error(err)
    }
    return ResponseUtil.ok('success')
  }
}

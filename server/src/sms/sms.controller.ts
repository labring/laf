import { IRequest } from 'src/utils/interface'
import { Body, Controller, Logger, Post, Req } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import SmsService from './sms.service'
import { SmsLoginCodeDto } from './dto/sms-code.dto'
import { ResponseUtil } from 'src/utils/response'

@ApiTags('Sms')
@Controller('sms')
export default class SmsModule {
  private logger = new Logger(SmsModule.name)
  constructor(private readonly smsService: SmsService) {}

  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Send sms code for login' })
  @Post('code/login')
  async getSmsLoginCode(@Req() req: IRequest, @Body() dto: SmsLoginCodeDto) {
    const ip = req.headers['x-real-ip'] as string
    const { code, error } = await this.smsService.getSmsLoginCode(dto, ip)
    if (code === 'SUCCESS') {
      return ResponseUtil.ok(code)
    }
    return ResponseUtil.error(error)
  }
}

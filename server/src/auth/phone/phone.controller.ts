import { SmsVerifyCodeType } from '@prisma/client'
import { IRequest } from 'src/utils/interface'
import { Body, Controller, Logger, Post, Req } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ResponseUtil } from 'src/utils/response'
import { SendPhoneCodeDto } from '../dto/send-phone-code.dto'
import { PhoneService } from './phone.service'

@ApiTags('Authentication - New')
@Controller('auth')
export class PhoneController {
  private readonly logger = new Logger(PhoneController.name)

  constructor(private readonly phoneService: PhoneService) {}

  /**
   * send phone code by username and password
   */
  @ApiOperation({ summary: 'Signup by user-password' })
  @ApiResponse({ type: ResponseUtil })
  @Post('phone/sms/code')
  async sendPhoneCode(@Req() req: IRequest, @Body() dto: SendPhoneCodeDto) {
    const { phone, type } = dto
    const ip = req.headers['x-real-ip'] as string

    const err = await this.phoneService.sendPhoneCode(phone, type, ip)
    if (err) {
      return ResponseUtil.error(err)
    }
    return ResponseUtil.ok('success')
  }
}

import { Injectable, Logger } from '@nestjs/common'
import { SmsVerifyCodeType } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { SmsService } from 'src/auth/phone/sms.service'

@Injectable()
export class PhoneService {
  private readonly logger = new Logger(PhoneService.name)
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
  ) {}

  async sendPhoneCode(phone: string, type: string, ip: string) {
    // check if phone number satisfy the send condition
    let err = await this.smsService.checkSendable(phone, ip)
    if (err) {
      return err
    }

    // Send sms code
    const code = Math.floor(Math.random() * 900000 + 100000).toString()
    err = await this.smsService.sendPhoneCode(phone, code)
    if (err) {
      return err
    }

    // Save sms code to database

    await this.smsService.saveSmsCode({
      phone,
      code,
      ip,
      type: type as any as SmsVerifyCodeType,
    })

    return null
  }
}

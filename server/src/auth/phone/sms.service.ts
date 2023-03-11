import { AuthenticationService } from '../authentication.service'
import { Injectable, Logger } from '@nestjs/common'
import { Prisma, SmsVerifyCodeType } from '@prisma/client'
import Dysmsapi, * as dysmsapi from '@alicloud/dysmsapi20170525'
import * as OpenApi from '@alicloud/openapi-client'
import * as Util from '@alicloud/tea-util'
import { ALISMS_KEY } from 'src/constants'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class SmsService {
  private logger = new Logger(SmsService.name)
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthenticationService,
  ) {}

  /**
   * send sms login code to given phone number
   * @param dto phone number
   * @param ip client ip
   * @returns { code, error }
   */
  async sendPhoneCode(phone: string, code: string) {
    try {
      this.logger.debug(`send sms code: ${code} to ${phone}`)

      const res = await this.sendAlismsCode(phone, code.toString())
      if (res.body.code !== 'OK') {
        return `ALISMS_ERROR: ${res.body.message}`
      }
      return null
    } catch (error) {
      this.logger.error(error, error.response?.body)
      return error.message
    }
  }

  /**
   * check if phone number satisfy the send condition
   * @param phone phone number
   * @param ip client ip
   * @returns { error }
   *
   */
  async checkSendable(phone: string, ip: string) {
    // Check if valid phone number
    if (!/^1[3456789]\d{9}$/.test(phone)) {
      return 'INVALID_PHONE'
    }

    // Check if phone number has been send sms code in 1 minute
    const count = await this.prisma.smsVerifyCode.count({
      where: {
        phone: phone,
        createdAt: {
          gt: new Date(Date.now() - 60 * 1000),
        },
      },
    })
    if (count > 0) {
      return 'REQUEST_OVERLIMIT: phone number has been send sms code in 1 minute'
    }

    // Check if ip has been send sms code beyond 30 times in 24 hours
    const countIps = await this.prisma.smsVerifyCode.count({
      where: {
        ip: ip,
        createdAt: {
          gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    })
    if (countIps > 30) {
      return 'REQUEST_OVERLIMIT: ip has been send sms code beyond 30 times in 24 hours'
    }

    return null
  }

  async saveSmsCode(data: Prisma.SmsVerifyCodeCreateInput) {
    await this.prisma.smsVerifyCode.create({
      data,
    })
  }

  /**
   * Check if given phone and code is valid
   * @param phone phone number
   * @param code verify code provided by client
   * @returns is valid
   */
  async isCodeValid(
    phone: string,
    code: string,
    type: SmsVerifyCodeType,
  ): Promise<boolean> {
    try {
      const total = await this.prisma.smsVerifyCode.count({
        where: {
          phone,
          code,
          type,
          state: 0,
          createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
        },
      })

      if (total === 0) return false

      return true
    } catch (error) {
      this.logger.error(error)
      return false
    }
  }

  /**
   * Disable verify code
   * @param phone phone number
   * @param code verify code
   * @returns void
   */
  async disableVerifyCode(
    phone: string,
    code: string,
    type: SmsVerifyCodeType,
  ) {
    await this.prisma.smsVerifyCode.updateMany({
      where: {
        phone,
        code,
        type,
        state: 0,
      },
      data: {
        state: 1,
      },
    })
  }

  // send sms code to phone using alisms
  private async sendAlismsCode(phone: string, code: string) {
    const { accessKeyId, accessKeySecret, templateCode, signName, endpoint } =
      await this.loadAlismsConfig()

    const sendSmsRequest = new dysmsapi.SendSmsRequest({
      phoneNumbers: phone,
      signName,
      templateCode,
      templateParam: `{"code":${code}}`,
    })

    const config = new OpenApi.Config({
      accessKeyId,
      accessKeySecret,
      endpoint,
    })

    const client = new Dysmsapi(config)
    const runtime = new Util.RuntimeOptions({})
    return await client.sendSmsWithOptions(sendSmsRequest, runtime)
  }

  // load alisms config from database
  private async loadAlismsConfig() {
    const phoneProvider = await this.authService.getProvider('phone')
    return phoneProvider.config[ALISMS_KEY]
  }
}

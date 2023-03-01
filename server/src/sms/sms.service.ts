import { Injectable, Logger } from '@nestjs/common'
import SettingsService from '../settings/settings.service'
import { SmsVerifyCodeType } from '@prisma/client'
import Dysmsapi, * as dysmsapi from '@alicloud/dysmsapi20170525'
import * as OpenApi from '@alicloud/openapi-client'
import * as Util from '@alicloud/tea-util'
import { SmsLoginCodeDto } from './dto/sms-code.dto'
import { AlismsConfig, ServiceResponse } from 'src/utils/interface'
import { ALISMS_KEY } from 'src/constants'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export default class SmsService {
  private logger = new Logger(SmsService.name)
  constructor(
    private readonly configService: SettingsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * send sms login code to given phone number
   * @param dto phone number
   * @param ip client ip
   * @returns { code, error }
   */
  async getSmsLoginCode(
    dto: SmsLoginCodeDto,
    ip: string,
  ): Promise<ServiceResponse> {
    // 1. Check if valid phone number
    if (!/^1[3456789]\d{9}$/.test(dto.phone)) {
      return { code: 'INVALID_PHONE', error: '手机号码有误' }
    }

    try {
      // 2. Check if phone number has been send sms code in 1 minute
      const count = await this.prisma.smsVerifyCode.count({
        where: {
          phone: dto.phone,
          createdAt: {
            gt: new Date(Date.now() - 60 * 1000),
          },
        },
      })
      if (count > 0) {
        return {
          code: 'REQUEST_OVERLIMIT',
          error: 'phone number has been send sms code in 1 minute',
        }
      }

      // 3. Check if ip has been send sms code beyond 30 times in 24 hours
      const countIps = await this.prisma.smsVerifyCode.count({
        where: {
          ip: ip,
          createdAt: {
            gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      })
      if (countIps > 30) {
        return {
          code: 'REQUEST_OVERLIMIT',
          error: 'ip has been send sms code beyond 30 times in 24 hours',
        }
      }

      // 4. Send sms code
      const code = Math.floor(Math.random() * 900000) + 100000
      this.logger.debug(`send sms code: ${code} to ${dto.phone}`)
      const res = await this._sendAlismsCode(dto.phone, code.toString())
      if (res.body.code !== 'OK') {
        return {
          code: 'ALISMS_ERROR',
          error: res.body.message,
        }
      }

      // 5. save sms code to database
      await this.prisma.smsVerifyCode.create({
        data: {
          phone: dto.phone,
          code: code.toString(),
          ip: ip,
          type: SmsVerifyCodeType.Login,
          state: 0,
        },
      })
      return { code: 'SUCCESS' }
    } catch (error) {
      this.logger.error(error, error.response?.body)
      return { code: 'INTERNAL_ERROR', error: error.message }
    }
  }

  /**
   * Check if given phone and code is valid
   * @param phone phone number
   * @param code verify code provided by client
   * @returns is valid
   */
  async isVerifyCodeValid(phone: string, code: string): Promise<boolean> {
    try {
      const total = await this.prisma.smsVerifyCode.count({
        where: {
          phone,
          code,
          type: SmsVerifyCodeType.Login,
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
  async disableVerifyCode(phone: string, code: string) {
    try {
      await this.prisma.smsVerifyCode.updateMany({
        where: {
          phone,
          code,
          type: SmsVerifyCodeType.Login,
          state: 0,
        },
        data: {
          state: 1,
        },
      })
    } catch (error) {
      this.logger.error(error)
    }
  }

  // send sms code to phone using alisms
  private async _sendAlismsCode(phone: string, code: string) {
    const { accessKeyId, accessKeySecret, templateCode, signName, endpoint } =
      await this._loadAlismsConfig()

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
  private async _loadAlismsConfig(): Promise<AlismsConfig> {
    const configString = await this.configService.getConfig(ALISMS_KEY)
    return JSON.parse(configString)
  }
}

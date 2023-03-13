import { Injectable } from '@nestjs/common'
import { GenerateOrderNumber, GenerateRandomString } from 'src/utils/random'
import { WeChatPaymentChannelSpec, WeChatPaymentRequestBody } from './types'
import * as crypto from 'crypto'
import { PaymentChannelService } from './payment-channel.service'
import { HttpService } from '@nestjs/axios'
import { ServerConfig } from 'src/constants'

@Injectable()
export class WeChatPaymentService {
  static readonly API_BASE_URL = 'https://api.mch.weixin.qq.com'
  static readonly API_NATIVE_PAY_URL = '/v3/pay/transactions/native'

  constructor(
    private readonly channelService: PaymentChannelService,
    private readonly httpService: HttpService,
  ) {}

  async pay(
    order: WeChatPaymentRequestBody,
    channelSpec: WeChatPaymentChannelSpec,
  ) {
    const timestamp = Math.floor(Date.now() / 1000)
    const nonceStr = GenerateRandomString(32)
    const signature = this.createSign(timestamp, nonceStr, order, channelSpec)
    const serialNo = channelSpec.certificateSerialNumber

    const token = `WECHATPAY2-SHA256-RSA2048 mchid="xxxx",nonce_str="${nonceStr}",timestamp="${timestamp}",signature="${signature}",serial_no="${serialNo}"`
    const headers = {
      Authorization: token,
    }

    const apiUrl = `${WeChatPaymentService.API_BASE_URL}${WeChatPaymentService.API_NATIVE_PAY_URL}}`
    const res = await this.httpService.axiosRef.post(apiUrl, order, {
      headers,
    })

    return res.data
  }

  async getChannelData(amount: number, channelSpec: WeChatPaymentChannelSpec) {
    const orderNumber = GenerateOrderNumber()
    const data: WeChatPaymentRequestBody = {
      mchid: channelSpec.mchid,
      appid: channelSpec.appid,
      description: 'Account charge',
      out_trade_no: orderNumber,
      notify_url: this.getNotifyUrl(),
      amount: {
        total: amount,
        currency: 'CNY',
      },
    }
    return data
  }

  createSign(
    timestamp: number,
    nonce_str: string,
    order: WeChatPaymentRequestBody,
    channelSpec: WeChatPaymentChannelSpec,
  ) {
    const method = 'POST'
    const url = WeChatPaymentService.API_NATIVE_PAY_URL
    const orderStr = JSON.stringify(order)
    const signStr = `${method}\n${url}\n${timestamp}\n${nonce_str}\n${orderStr}\n`
    const cert = channelSpec.privateKey
    const sign = crypto.createSign('RSA-SHA256')
    sign.update(signStr)
    return sign.sign(cert, 'base64')
  }

  getNotifyUrl() {
    const apiUrl = ServerConfig.API_SERVER_URL
    return `${apiUrl}/v1/accounts/payment/wechat/notify`
  }
}

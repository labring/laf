import { Injectable } from '@nestjs/common'
import {
  WeChatPaySpec,
  WeChatPayOrder,
  WeChatPayOrderResponse,
  WeChatPayDecryptedResult,
} from './types'
import * as crypto from 'crypto'
import { HttpService } from '@nestjs/axios'
import { ServerConfig } from 'src/constants'
// import * as WxPay from 'wechatpay-node-v3'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const WxPay = require('wechatpay-node-v3')

@Injectable()
export class WeChatPayService {
  static readonly API_BASE_URL = 'https://api.mch.weixin.qq.com'

  constructor(private readonly httpService: HttpService) {}

  async send(spec: WeChatPaySpec, order: WeChatPayOrder) {
    // sign the order
    const timestamp = Math.floor(Date.now() / 1000)
    const nonceStr = crypto.randomUUID()
    const method = 'POST'
    const apiUrl = '/v3/pay/transactions/native'
    const signature = this.createSign(
      spec,
      method,
      apiUrl,
      timestamp,
      nonceStr,
      order,
    )

    // send the request
    const serialNo = spec.certificateSerialNumber
    const token = `WECHATPAY2-SHA256-RSA2048 mchid="${spec.mchid}",nonce_str="${nonceStr}",timestamp="${timestamp}",signature="${signature}",serial_no="${serialNo}"`
    const fullUrl = `${WeChatPayService.API_BASE_URL}${apiUrl}`
    const res = await this.httpService.axiosRef.post(fullUrl, order, {
      headers: { Authorization: token },
    })

    return res.data
  }

  private createSign(
    spec: WeChatPaySpec,
    method: string,
    url: string,
    timestamp: number,
    nonceStr: string,
    order: WeChatPayOrder,
  ) {
    let orderStr = ''
    if (method === 'POST' && order) {
      orderStr = JSON.stringify(order)
    }
    const signStr = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${orderStr}\n`
    const cert = spec.privateKey
    const sign = crypto.createSign('RSA-SHA256')
    sign.update(signStr)
    return sign.sign(cert, 'base64')
  }

  getClient(spec: WeChatPaySpec) {
    const client = new WxPay({
      appid: spec.appid,
      mchid: spec.mchid,
      serial_no: spec.certificateSerialNumber,
      key: spec.apiV3Key,
      publicKey: Buffer.from(spec.publicKey, 'utf8'),
      privateKey: Buffer.from(spec.privateKey, 'utf8'),
    })

    return client
  }

  async getWeChatPayNotifyResult(
    spec: WeChatPaySpec,
    params: {
      timestamp: string | number
      nonce: string
      body: WeChatPayOrderResponse
      serial: string
      signature: string
    },
  ) {
    const valid = await this.verifyNotify(spec, params)
    if (!valid) {
      throw new Error('Invalid wechat pay notify')
    }

    const resource = params.body.resource
    const result = this.decryptNotify(
      spec,
      resource.ciphertext,
      resource.associated_data,
      resource.nonce,
    )

    return result as WeChatPayDecryptedResult
  }

  async verifyNotify(
    spec: WeChatPaySpec,
    params: {
      timestamp: string | number
      nonce: string
      body: string | Record<string, any>
      serial: string
      signature: string
    },
  ) {
    const client = this.getClient(spec)
    return await client.verifySign(params)
  }

  decryptNotify(
    spec: WeChatPaySpec,
    ciphertext: string,
    associated_data: string,
    nonce: string,
  ) {
    const client = this.getClient(spec)
    return client.decipher_gcm(ciphertext, associated_data, nonce)
  }

  getNotifyUrl() {
    const apiUrl = ServerConfig.API_SERVER_URL
    return `${apiUrl}/v1/accounts/payment/wechat-notify`
  }
}

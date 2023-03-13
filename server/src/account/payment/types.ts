export interface WeChatPaymentChannelSpec {
  mchid: string
  appid: string
  apiV3Key: string
  certificateSerialNumber: string
  privateKey: string
}

export interface WeChatPaymentRequestBody {
  mchid: string
  appid: string
  description: string
  out_trade_no: string
  notify_url: string
  amount: {
    total: number
    currency: string
  }
}

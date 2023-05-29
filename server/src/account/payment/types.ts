import { AccountChargeOrder } from '../entities/account-charge-order'

export interface WeChatPaySpec {
  mchid: string
  appid: string
  apiV3Key: string
  certificateSerialNumber: string
  publicKey: string
  privateKey: string
}

export interface WeChatPayOrder {
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

export interface WeChatPayOrderResponse {
  id: string
  create_time: string
  resource_type: string
  event_type: string
  summary: string
  resource: {
    original_type: string
    algorithm: string
    ciphertext: string
    associated_data: string
    nonce: string
  }
}

export enum WeChatPayTradeState {
  SUCCESS = 'SUCCESS',
  REFUND = 'REFUND',
  NOTPAY = 'NOTPAY',
  CLOSED = 'CLOSED',
  REVOKED = 'REVOKED',
  USERPAYING = 'USERPAYING',
  PAYERROR = 'PAYERROR',
}

export interface WeChatPayDecryptedResult {
  mchid: string
  appid: string
  out_trade_no: string
  transaction_id: string
  trade_type: string
  trade_state: WeChatPayTradeState
  trade_state_desc: string
  bank_type: string
  attach: string
  success_time: string
  payer: { openid: string }
  amount: {
    total: number
    payer_total: number
    currency: string
    payer_currency: string
  }
}

export type WeChatPayChargeOrder = AccountChargeOrder<WeChatPayDecryptedResult>

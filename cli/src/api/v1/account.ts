import { request, RequestParams } from '../../util/request'
import {
  AccountControllerGetChargeOrderAmountParams,
  AccountControllerGetChargeRecordsParams,
  AccountControllerInviteCodeProfitParams,
  AccountControllerWechatNotifyData,
  CreateChargeOrderDto,
  UseGiftCodeDto,
} from './data-contracts'

/**
 * No description
 *
 * @tags Account
 * @name AccountControllerFindOne
 * @summary Get account info
 * @request GET:/v1/accounts
 * @secure
 */
export async function accountControllerFindOne(configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/accounts`,
    method: 'GET',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Account
 * @name AccountControllerGetChargeOrderAmount
 * @summary Get charge order total amount
 * @request GET:/v1/accounts/charge-order/amount
 * @secure
 */
export async function accountControllerGetChargeOrderAmount(
  query: AccountControllerGetChargeOrderAmountParams,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/accounts/charge-order/amount`,
    method: 'GET',
    params: query,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Account
 * @name AccountControllerGetChargeOrder
 * @summary Get charge order
 * @request GET:/v1/accounts/charge-order/{id}
 * @secure
 */
export async function accountControllerGetChargeOrder(id: string, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/accounts/charge-order/${id}`,
    method: 'GET',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Account
 * @name AccountControllerGetChargeRecords
 * @summary get all charge order
 * @request GET:/v1/accounts/charge-orders
 * @secure
 */
export async function accountControllerGetChargeRecords(
  query: AccountControllerGetChargeRecordsParams,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/accounts/charge-orders`,
    method: 'GET',
    params: query,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Account
 * @name AccountControllerCharge
 * @summary Create charge order
 * @request POST:/v1/accounts/charge-order
 * @secure
 */
export async function accountControllerCharge(
  data: CreateChargeOrderDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/accounts/charge-order`,
    method: 'POST',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Account
 * @name AccountControllerGetChargeRewardList
 * @summary Get charge reward list
 * @request GET:/v1/accounts/charge-reward
 * @secure
 */
export async function accountControllerGetChargeRewardList(configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/accounts/charge-reward`,
    method: 'GET',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Account
 * @name AccountControllerWechatNotify
 * @request POST:/v1/accounts/payment/wechat-notify
 * @secure
 */
export async function accountControllerWechatNotify(
  configParams: RequestParams = {},
): Promise<AccountControllerWechatNotifyData> {
  return request({
    url: `/v1/accounts/payment/wechat-notify`,
    method: 'POST',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Account
 * @name AccountControllerGiftCode
 * @summary Use a gift code
 * @request POST:/v1/accounts/gift-code
 * @secure
 */
export async function accountControllerGiftCode(data: UseGiftCodeDto, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/accounts/gift-code`,
    method: 'POST',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Account
 * @name AccountControllerInviteCode
 * @summary get a invite code
 * @request GET:/v1/accounts/invite-code
 * @secure
 */
export async function accountControllerInviteCode(configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/accounts/invite-code`,
    method: 'GET',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Account
 * @name AccountControllerInviteCodeProfit
 * @summary get invite code profit
 * @request GET:/v1/accounts/invite-profit
 * @secure
 */
export async function accountControllerInviteCodeProfit(
  query: AccountControllerInviteCodeProfitParams,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/accounts/invite-profit`,
    method: 'GET',
    params: query,
    ...configParams,
  })
}

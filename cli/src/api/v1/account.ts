import { request, RequestParams } from "../../util/request";
import { AccountControllerWechatNotifyData, CreateChargeOrderDto } from "./data-contracts";

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
    method: "GET",
    ...configParams,
  });
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
    method: "GET",
    ...configParams,
  });
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
    method: "POST",
    data: data,
    ...configParams,
  });
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
    method: "POST",
    ...configParams,
  });
}

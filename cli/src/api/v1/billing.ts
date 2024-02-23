import { request, RequestParams } from '../../util/request'
import {
  BillingControllerFindAllParams,
  BillingControllerGetExpenseByDayParams,
  BillingControllerGetExpenseParams,
  CalculatePriceDto,
} from './data-contracts'

/**
 * No description
 *
 * @tags Billing
 * @name BillingControllerFindAll
 * @summary Get billings of an application
 * @request GET:/v1/billings
 * @secure
 */
export async function billingControllerFindAll(
  query: BillingControllerFindAllParams,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/billings`,
    method: 'GET',
    params: query,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Billing
 * @name BillingControllerGetExpense
 * @summary Get my total amount
 * @request GET:/v1/billings/amount
 * @secure
 */
export async function billingControllerGetExpense(
  query: BillingControllerGetExpenseParams,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/billings/amount`,
    method: 'GET',
    params: query,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Billing
 * @name BillingControllerGetExpenseByDay
 * @summary Get my total amount by day
 * @request GET:/v1/billings/amounts
 * @secure
 */
export async function billingControllerGetExpenseByDay(
  query: BillingControllerGetExpenseByDayParams,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/billings/amounts`,
    method: 'GET',
    params: query,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Billing
 * @name ResourceControllerCalculatePrice
 * @summary Calculate pricing
 * @request POST:/v1/resources/price
 */
export async function resourceControllerCalculatePrice(
  data: CalculatePriceDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/resources/price`,
    method: 'POST',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Billing
 * @name ResourceControllerGetResourceOptions
 * @summary Get resource option list
 * @request GET:/v1/resources/resource-options
 */
export async function resourceControllerGetResourceOptions(configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/resources/resource-options`,
    method: 'GET',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Billing
 * @name ResourceControllerGetResourceOptionsByRegionId
 * @summary Get resource option list by region id
 * @request GET:/v1/resources/resource-options/{regionId}
 */
export async function resourceControllerGetResourceOptionsByRegionId(
  regionId: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/resources/resource-options/${regionId}`,
    method: 'GET',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Billing
 * @name ResourceControllerGetResourceBundles
 * @summary Get resource template list
 * @request GET:/v1/resources/resource-bundles
 */
export async function resourceControllerGetResourceBundles(configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/resources/resource-bundles`,
    method: 'GET',
    ...configParams,
  })
}

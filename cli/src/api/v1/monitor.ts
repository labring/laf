import { request, RequestParams } from '../../util/request'
import { MonitorControllerGetDataParams } from './data-contracts'

/**
 * No description
 *
 * @tags Monitor
 * @name MonitorControllerGetData
 * @summary Get monitor metrics data
 * @request GET:/v1/monitor/{appid}/metrics
 * @secure
 */
export async function monitorControllerGetData(
  { appid, ...query }: MonitorControllerGetDataParams,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/monitor/${appid}/metrics`,
    method: 'GET',
    params: query,
    ...configParams,
  })
}

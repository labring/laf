import { request, RequestParams } from '../../util/request'
import {
  DeleteRecycleBinItemsDto,
  FunctionRecycleBinControllerGetRecycleBinParams,
  RestoreRecycleBinItemsDto,
} from './data-contracts'

/**
 * No description
 *
 * @tags RecycleBin
 * @name FunctionRecycleBinControllerDeleteRecycleBinItems
 * @summary Delete function Recycle bin items
 * @request POST:/v1/recycle-bin/{appid}/functions/delete
 * @secure
 */
export async function functionRecycleBinControllerDeleteRecycleBinItems(
  appid: string,
  data: DeleteRecycleBinItemsDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/recycle-bin/${appid}/functions/delete`,
    method: 'POST',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags RecycleBin
 * @name FunctionRecycleBinControllerEmptyRecycleBin
 * @summary Empty function Recycle bin items
 * @request DELETE:/v1/recycle-bin/{appid}/functions
 * @secure
 */
export async function functionRecycleBinControllerEmptyRecycleBin(
  appid: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/recycle-bin/${appid}/functions`,
    method: 'DELETE',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags RecycleBin
 * @name FunctionRecycleBinControllerGetRecycleBin
 * @summary Get cloud function recycle bin
 * @request GET:/v1/recycle-bin/{appid}/functions
 * @secure
 */
export async function functionRecycleBinControllerGetRecycleBin(
  { appid, ...query }: FunctionRecycleBinControllerGetRecycleBinParams,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/recycle-bin/${appid}/functions`,
    method: 'GET',
    params: query,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags RecycleBin
 * @name FunctionRecycleBinControllerRestoreRecycleBinItems
 * @summary restore function Recycle bin items
 * @request POST:/v1/recycle-bin/{appid}/functions/restore
 * @secure
 */
export async function functionRecycleBinControllerRestoreRecycleBinItems(
  appid: string,
  data: RestoreRecycleBinItemsDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/recycle-bin/${appid}/functions/restore`,
    method: 'POST',
    data: data,
    ...configParams,
  })
}

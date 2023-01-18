import { request, RequestParams } from "../../util/request";
import { CreateTriggerDto } from "./data-contracts";

/**
 * No description
 *
 * @tags Trigger
 * @name TriggerControllerCreate
 * @summary Create a cron trigger
 * @request POST:/v1/apps/{appid}/triggers
 * @secure
 */
export async function triggerControllerCreate(
  appid: string,
  data: CreateTriggerDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/triggers`,
    method: "POST",
    data: data,
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Trigger
 * @name TriggerControllerFindAll
 * @summary Get trigger list of an application
 * @request GET:/v1/apps/{appid}/triggers
 * @secure
 */
export async function triggerControllerFindAll(appid: string, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/triggers`,
    method: "GET",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Trigger
 * @name TriggerControllerRemove
 * @summary Remove a cron trigger
 * @request DELETE:/v1/apps/{appid}/triggers/{id}
 * @secure
 */
export async function triggerControllerRemove(
  appid: string,
  id: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/triggers/${id}`,
    method: "DELETE",
    ...configParams,
  });
}

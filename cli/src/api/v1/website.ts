import { request, RequestParams } from "../../util/request";
import {
  CreateWebsiteDto,
  UpdateWebsiteDto,
  WebsitesControllerCreateData,
  WebsitesControllerFindAllData,
  WebsitesControllerFindOneData,
  WebsitesControllerRemoveData,
  WebsitesControllerUpdateData,
} from "./data-contracts";

/**
 * No description
 *
 * @tags Website
 * @name WebsitesControllerCreate
 * @summary TODO - ⌛️
 * @request POST:/v1/apps/{appid}/websites
 * @secure
 */
export async function websitesControllerCreate(
  appid: string,
  data: CreateWebsiteDto,
  configParams: RequestParams = {},
): Promise<WebsitesControllerCreateData> {
  return request({
    url: `/v1/apps/${appid}/websites`,
    method: "POST",
    data: data,
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Website
 * @name WebsitesControllerFindAll
 * @summary TODO - ⌛️
 * @request GET:/v1/apps/{appid}/websites
 * @secure
 */
export async function websitesControllerFindAll(
  appid: string,
  configParams: RequestParams = {},
): Promise<WebsitesControllerFindAllData> {
  return request({
    url: `/v1/apps/${appid}/websites`,
    method: "GET",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Website
 * @name WebsitesControllerFindOne
 * @summary TODO - ⌛️
 * @request GET:/v1/apps/{appid}/websites/{id}
 * @secure
 */
export async function websitesControllerFindOne(
  id: string,
  appid: string,
  configParams: RequestParams = {},
): Promise<WebsitesControllerFindOneData> {
  return request({
    url: `/v1/apps/${appid}/websites/${id}`,
    method: "GET",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Website
 * @name WebsitesControllerUpdate
 * @summary TODO - ⌛️
 * @request PATCH:/v1/apps/{appid}/websites/{id}
 * @secure
 */
export async function websitesControllerUpdate(
  id: string,
  appid: string,
  data: UpdateWebsiteDto,
  configParams: RequestParams = {},
): Promise<WebsitesControllerUpdateData> {
  return request({
    url: `/v1/apps/${appid}/websites/${id}`,
    method: "PATCH",
    data: data,
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Website
 * @name WebsitesControllerRemove
 * @summary TODO - ⌛️
 * @request DELETE:/v1/apps/{appid}/websites/{id}
 * @secure
 */
export async function websitesControllerRemove(
  id: string,
  appid: string,
  configParams: RequestParams = {},
): Promise<WebsitesControllerRemoveData> {
  return request({
    url: `/v1/apps/${appid}/websites/${id}`,
    method: "DELETE",
    ...configParams,
  });
}

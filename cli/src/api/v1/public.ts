import { request, RequestParams } from "../../util/request";
import { AppControllerGetRuntimesData, RegionControllerGetRegionsData } from "./data-contracts";

/**
 * No description
 *
 * @tags Public
 * @name AppControllerGetRuntimes
 * @summary Get application runtime list
 * @request GET:/v1/runtimes
 */
export async function appControllerGetRuntimes(
  configParams: RequestParams = {},
): Promise<AppControllerGetRuntimesData> {
  return request({
    url: `/v1/runtimes`,
    method: "GET",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Public
 * @name RegionControllerGetRegions
 * @summary Get region list
 * @request GET:/v1/regions
 */
export async function regionControllerGetRegions(
  configParams: RequestParams = {},
): Promise<RegionControllerGetRegionsData> {
  return request({
    url: `/v1/regions`,
    method: "GET",
    ...configParams,
  });
}

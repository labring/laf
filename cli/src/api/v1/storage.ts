import { request, RequestParams } from "../../util/request";
import { CreateBucketDto, UpdateBucketDto } from "./data-contracts";

/**
 * No description
 *
 * @tags Storage
 * @name BucketControllerCreate
 * @summary Create a new bucket
 * @request POST:/v1/apps/{appid}/buckets
 * @secure
 */
export async function bucketControllerCreate(
  appid: string,
  data: CreateBucketDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/buckets`,
    method: "POST",
    data: data,
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Storage
 * @name BucketControllerFindAll
 * @summary Get bucket list of an app
 * @request GET:/v1/apps/{appid}/buckets
 * @secure
 */
export async function bucketControllerFindAll(appid: string, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/buckets`,
    method: "GET",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Storage
 * @name BucketControllerFindOne
 * @summary Get a bucket by name
 * @request GET:/v1/apps/{appid}/buckets/{name}
 * @secure
 */
export async function bucketControllerFindOne(
  appid: string,
  name: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/buckets/${name}`,
    method: "GET",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Storage
 * @name BucketControllerUpdate
 * @summary Update a bucket
 * @request PATCH:/v1/apps/{appid}/buckets/{name}
 * @secure
 */
export async function bucketControllerUpdate(
  appid: string,
  name: string,
  data: UpdateBucketDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/buckets/${name}`,
    method: "PATCH",
    data: data,
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Storage
 * @name BucketControllerRemove
 * @summary Delete a bucket
 * @request DELETE:/v1/apps/{appid}/buckets/{name}
 * @secure
 */
export async function bucketControllerRemove(
  appid: string,
  name: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/buckets/${name}`,
    method: "DELETE",
    ...configParams,
  });
}

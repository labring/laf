import { request, RequestParams } from "../../util/request";
import {
  CreateCollectionDto,
  CreatePolicyDto,
  CreatePolicyRuleDto,
  DatabaseControllerProxyData,
  UpdateCollectionDto,
  UpdatePolicyDto,
  UpdatePolicyRuleDto,
} from "./data-contracts";

/**
 * No description
 *
 * @tags Database
 * @name CollectionControllerCreate
 * @summary Create a new collection in database
 * @request POST:/v1/apps/{appid}/collections
 * @secure
 */
export async function collectionControllerCreate(
  appid: string,
  data: CreateCollectionDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/collections`,
    method: "POST",
    data: data,
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Database
 * @name CollectionControllerFindAll
 * @summary Get collection list of an application
 * @request GET:/v1/apps/{appid}/collections
 * @secure
 */
export async function collectionControllerFindAll(appid: string, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/collections`,
    method: "GET",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Database
 * @name CollectionControllerFindOne
 * @summary Get collection by name
 * @request GET:/v1/apps/{appid}/collections/{name}
 * @secure
 */
export async function collectionControllerFindOne(
  appid: string,
  name: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/collections/${name}`,
    method: "GET",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Database
 * @name CollectionControllerUpdate
 * @summary Update a collection
 * @request PATCH:/v1/apps/{appid}/collections/{name}
 * @secure
 */
export async function collectionControllerUpdate(
  appid: string,
  name: string,
  data: UpdateCollectionDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/collections/${name}`,
    method: "PATCH",
    data: data,
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Database
 * @name CollectionControllerRemove
 * @summary Delete a collection by its name
 * @request DELETE:/v1/apps/{appid}/collections/{name}
 * @secure
 */
export async function collectionControllerRemove(
  appid: string,
  name: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/collections/${name}`,
    method: "DELETE",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Database
 * @name PolicyControllerCreate
 * @summary Create database policy
 * @request POST:/v1/apps/{appid}/policies
 * @secure
 */
export async function policyControllerCreate(
  appid: string,
  data: CreatePolicyDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/policies`,
    method: "POST",
    data: data,
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Database
 * @name PolicyControllerFindAll
 * @summary Get database policy list
 * @request GET:/v1/apps/{appid}/policies
 * @secure
 */
export async function policyControllerFindAll(appid: string, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/policies`,
    method: "GET",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Database
 * @name PolicyControllerUpdate
 * @summary Update database policy
 * @request PATCH:/v1/apps/{appid}/policies/{name}
 * @secure
 */
export async function policyControllerUpdate(
  appid: string,
  name: string,
  data: UpdatePolicyDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/policies/${name}`,
    method: "PATCH",
    data: data,
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Database
 * @name PolicyControllerRemove
 * @summary Remove a database policy
 * @request DELETE:/v1/apps/{appid}/policies/{name}
 * @secure
 */
export async function policyControllerRemove(
  appid: string,
  name: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/policies/${name}`,
    method: "DELETE",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Database
 * @name DatabaseControllerProxy
 * @summary The database proxy for database management
 * @request POST:/v1/apps/{appid}/databases/proxy
 * @secure
 */
export async function databaseControllerProxy(
  appid: string,
  configParams: RequestParams = {},
): Promise<DatabaseControllerProxyData> {
  return request({
    url: `/v1/apps/${appid}/databases/proxy`,
    method: "POST",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Database
 * @name PolicyRuleControllerCreate
 * @summary Create database policy rule
 * @request POST:/v1/apps/{appid}/policies/{name}/rules
 * @secure
 */
export async function policyRuleControllerCreate(
  appid: string,
  name: string,
  data: CreatePolicyRuleDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/policies/${name}/rules`,
    method: "POST",
    data: data,
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Database
 * @name PolicyRuleControllerFindAll
 * @summary Get database policy rules
 * @request GET:/v1/apps/{appid}/policies/{name}/rules
 * @secure
 */
export async function policyRuleControllerFindAll(
  appid: string,
  name: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/policies/${name}/rules`,
    method: "GET",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Database
 * @name PolicyRuleControllerUpdate
 * @summary Update database policy rule by collection name
 * @request PATCH:/v1/apps/{appid}/policies/{name}/rules/{collection}
 * @secure
 */
export async function policyRuleControllerUpdate(
  appid: string,
  name: string,
  collection: string,
  data: UpdatePolicyRuleDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/policies/${name}/rules/${collection}`,
    method: "PATCH",
    data: data,
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Database
 * @name PolicyRuleControllerRemove
 * @summary Remove a database policy rule by collection name
 * @request DELETE:/v1/apps/{appid}/policies/{name}/rules/{collection}
 * @secure
 */
export async function policyRuleControllerRemove(
  appid: string,
  name: string,
  collection: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/policies/${name}/rules/${collection}`,
    method: "DELETE",
    ...configParams,
  });
}

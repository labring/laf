import { request, RequestParams } from "../../util/request";
import { CompileFunctionDto, CreateFunctionDto, LogControllerGetLogsParams, UpdateFunctionDto } from "./data-contracts";

/**
 * No description
 *
 * @tags Function
 * @name FunctionControllerCreate
 * @summary Create a new function
 * @request POST:/v1/apps/{appid}/functions
 * @secure
 */
export async function functionControllerCreate(
  appid: string,
  data: CreateFunctionDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/functions`,
    method: "POST",
    data: data,
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Function
 * @name FunctionControllerFindAll
 * @summary Query function list of an app
 * @request GET:/v1/apps/{appid}/functions
 * @secure
 */
export async function functionControllerFindAll(appid: string, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/functions`,
    method: "GET",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Function
 * @name FunctionControllerFindOne
 * @summary Get a function by its name
 * @request GET:/v1/apps/{appid}/functions/{name}
 * @secure
 */
export async function functionControllerFindOne(
  appid: string,
  name: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/functions/${name}`,
    method: "GET",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Function
 * @name FunctionControllerUpdate
 * @summary Update a function
 * @request PATCH:/v1/apps/{appid}/functions/{name}
 * @secure
 */
export async function functionControllerUpdate(
  appid: string,
  name: string,
  data: UpdateFunctionDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/functions/${name}`,
    method: "PATCH",
    data: data,
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Function
 * @name FunctionControllerRemove
 * @summary Delete a function
 * @request DELETE:/v1/apps/{appid}/functions/{name}
 * @secure
 */
export async function functionControllerRemove(
  appid: string,
  name: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/functions/${name}`,
    method: "DELETE",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Function
 * @name FunctionControllerCompile
 * @summary Compile a function
 * @request POST:/v1/apps/{appid}/functions/{name}/compile
 * @secure
 */
export async function functionControllerCompile(
  appid: string,
  name: string,
  data: CompileFunctionDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/functions/${name}/compile`,
    method: "POST",
    data: data,
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Function
 * @name LogControllerGetLogs
 * @summary Get function logs
 * @request GET:/v1/apps/{appid}/logs/functions
 * @secure
 */
export async function logControllerGetLogs(
  { appid, ...query }: LogControllerGetLogsParams,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/logs/functions`,
    method: "GET",
    params: query,
    ...configParams,
  });
}

import { request, RequestParams } from "../../util/request";
import {
  ApplicationControllerCreateData,
  ApplicationControllerFindAllData,
  ApplicationControllerFindOneData,
  ApplicationControllerUpdateData,
  CreateApplicationDto,
  CreateDependencyDto,
  CreateEnvironmentDto,
  UpdateApplicationDto,
  UpdateDependencyDto,
} from "./data-contracts";

/**
 * No description
 *
 * @tags Application
 * @name ApplicationControllerCreate
 * @summary Create a new application
 * @request POST:/v1/applications
 * @secure
 */
export async function applicationControllerCreate(
  data: CreateApplicationDto,
  configParams: RequestParams = {},
): Promise<ApplicationControllerCreateData> {
  return request({
    url: `/v1/applications`,
    method: "POST",
    data: data,
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Application
 * @name ApplicationControllerFindAll
 * @summary Get user application list
 * @request GET:/v1/applications
 * @secure
 */
export async function applicationControllerFindAll(
  configParams: RequestParams = {},
): Promise<ApplicationControllerFindAllData> {
  return request({
    url: `/v1/applications`,
    method: "GET",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Application
 * @name ApplicationControllerFindOne
 * @summary Get an application by appid
 * @request GET:/v1/applications/{appid}
 * @secure
 */
export async function applicationControllerFindOne(
  appid: string,
  configParams: RequestParams = {},
): Promise<ApplicationControllerFindOneData> {
  return request({
    url: `/v1/applications/${appid}`,
    method: "GET",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Application
 * @name ApplicationControllerUpdate
 * @summary Update an application
 * @request PATCH:/v1/applications/{appid}
 * @secure
 */
export async function applicationControllerUpdate(
  appid: string,
  data: UpdateApplicationDto,
  configParams: RequestParams = {},
): Promise<ApplicationControllerUpdateData> {
  return request({
    url: `/v1/applications/${appid}`,
    method: "PATCH",
    data: data,
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Application
 * @name ApplicationControllerRemove
 * @summary Delete an application
 * @request DELETE:/v1/applications/{appid}
 * @secure
 */
export async function applicationControllerRemove(appid: string, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/applications/${appid}`,
    method: "DELETE",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Application
 * @name EnvironmentVariableControllerAdd
 * @summary Set a environment variable (create/update)
 * @request POST:/v1/apps/{appid}/environments
 * @secure
 */
export async function environmentVariableControllerAdd(
  appid: string,
  data: CreateEnvironmentDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/environments`,
    method: "POST",
    data: data,
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Application
 * @name EnvironmentVariableControllerGet
 * @summary Get environment variables
 * @request GET:/v1/apps/{appid}/environments
 * @secure
 */
export async function environmentVariableControllerGet(appid: string, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/environments`,
    method: "GET",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Application
 * @name EnvironmentVariableControllerDelete
 * @summary Delete an environment variable by name
 * @request DELETE:/v1/apps/{appid}/environments/{name}
 * @secure
 */
export async function environmentVariableControllerDelete(
  appid: string,
  name: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/environments/${name}`,
    method: "DELETE",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Application
 * @name DependencyControllerAdd
 * @summary Add application dependencies
 * @request POST:/v1/apps/{appid}/dependencies
 * @secure
 */
export async function dependencyControllerAdd(
  appid: string,
  data: CreateDependencyDto[],
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/dependencies`,
    method: "POST",
    data: data,
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Application
 * @name DependencyControllerUpdate
 * @summary Update application dependencies
 * @request PATCH:/v1/apps/{appid}/dependencies
 * @secure
 */
export async function dependencyControllerUpdate(
  appid: string,
  data: UpdateDependencyDto[],
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/dependencies`,
    method: "PATCH",
    data: data,
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Application
 * @name DependencyControllerGetDependencies
 * @summary Get application dependencies
 * @request GET:/v1/apps/{appid}/dependencies
 * @secure
 */
export async function dependencyControllerGetDependencies(
  appid: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/dependencies`,
    method: "GET",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Application
 * @name DependencyControllerRemove
 * @summary Remove a dependency
 * @request DELETE:/v1/apps/{appid}/dependencies/{name}
 * @secure
 */
export async function dependencyControllerRemove(
  appid: string,
  name: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/dependencies/${name}`,
    method: "DELETE",
    ...configParams,
  });
}

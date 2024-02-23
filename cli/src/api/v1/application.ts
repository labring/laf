import { request, RequestParams } from '../../util/request'
import {
  ApplicationControllerFindOneData,
  BindCustomDomainDto,
  CreateApplicationDto,
  CreateDependencyDto,
  CreateEnvironmentDto,
  DeleteDependencyDto,
  UpdateApplicationBundleDto,
  UpdateApplicationNameDto,
  UpdateApplicationStateDto,
  UpdateDependencyDto,
} from './data-contracts'

/**
 * No description
 *
 * @tags Application
 * @name ApplicationControllerCreate
 * @summary Create application
 * @request POST:/v1/applications
 * @secure
 */
export async function applicationControllerCreate(
  data: CreateApplicationDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/applications`,
    method: 'POST',
    data: data,
    ...configParams,
  })
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
export async function applicationControllerFindAll(configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/applications`,
    method: 'GET',
    ...configParams,
  })
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
    method: 'GET',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Application
 * @name ApplicationControllerDelete
 * @summary Delete an application
 * @request DELETE:/v1/applications/{appid}
 * @secure
 */
export async function applicationControllerDelete(appid: string, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/applications/${appid}`,
    method: 'DELETE',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Application
 * @name ApplicationControllerUpdateName
 * @summary Update application name
 * @request PATCH:/v1/applications/{appid}/name
 * @secure
 */
export async function applicationControllerUpdateName(
  appid: string,
  data: UpdateApplicationNameDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/applications/${appid}/name`,
    method: 'PATCH',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Application
 * @name ApplicationControllerUpdateState
 * @summary Update application state
 * @request PATCH:/v1/applications/{appid}/state
 * @secure
 */
export async function applicationControllerUpdateState(
  appid: string,
  data: UpdateApplicationStateDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/applications/${appid}/state`,
    method: 'PATCH',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Application
 * @name ApplicationControllerUpdateBundle
 * @summary Update application bundle
 * @request PATCH:/v1/applications/{appid}/bundle
 * @secure
 */
export async function applicationControllerUpdateBundle(
  appid: string,
  data: UpdateApplicationBundleDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/applications/${appid}/bundle`,
    method: 'PATCH',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Application
 * @name ApplicationControllerBindDomain
 * @summary Bind custom domain to application
 * @request PATCH:/v1/applications/{appid}/domain
 * @secure
 */
export async function applicationControllerBindDomain(
  appid: string,
  data: BindCustomDomainDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/applications/${appid}/domain`,
    method: 'PATCH',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Application
 * @name ApplicationControllerRemove
 * @summary Remove custom domain of application
 * @request DELETE:/v1/applications/{appid}/domain
 * @secure
 */
export async function applicationControllerRemove(appid: string, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/applications/${appid}/domain`,
    method: 'DELETE',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Application
 * @name ApplicationControllerCheckResolved
 * @summary Check if domain is resolved
 * @request POST:/v1/applications/{appid}/domain/resolved
 * @secure
 */
export async function applicationControllerCheckResolved(
  appid: string,
  data: BindCustomDomainDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/applications/${appid}/domain/resolved`,
    method: 'POST',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Application
 * @name EnvironmentVariableControllerUpdateAll
 * @summary Update environment variables (replace all)
 * @request POST:/v1/apps/{appid}/environments
 * @secure
 */
export async function environmentVariableControllerUpdateAll(
  appid: string,
  data: CreateEnvironmentDto[],
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/environments`,
    method: 'POST',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Application
 * @name EnvironmentVariableControllerAdd
 * @summary Set a environment variable (create/update)
 * @request PATCH:/v1/apps/{appid}/environments
 * @secure
 */
export async function environmentVariableControllerAdd(
  appid: string,
  data: CreateEnvironmentDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/environments`,
    method: 'PATCH',
    data: data,
    ...configParams,
  })
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
    method: 'GET',
    ...configParams,
  })
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
    method: 'DELETE',
    ...configParams,
  })
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
    method: 'POST',
    data: data,
    ...configParams,
  })
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
    method: 'PATCH',
    data: data,
    ...configParams,
  })
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
    method: 'GET',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Application
 * @name DependencyControllerRemove
 * @summary Remove a dependency
 * @request DELETE:/v1/apps/{appid}/dependencies
 * @secure
 */
export async function dependencyControllerRemove(
  appid: string,
  data: DeleteDependencyDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/dependencies`,
    method: 'DELETE',
    data: data,
    ...configParams,
  })
}

import { request, RequestParams } from '../../util/request'
import { BindCustomDomainDto, CreateWebsiteDto } from './data-contracts'

/**
 * No description
 *
 * @tags WebsiteHosting
 * @name WebsiteControllerCreate
 * @summary Create a new website
 * @request POST:/v1/apps/{appid}/websites
 * @secure
 */
export async function websiteControllerCreate(
  appid: string,
  data: CreateWebsiteDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/websites`,
    method: 'POST',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags WebsiteHosting
 * @name WebsiteControllerFindAll
 * @summary Get all websites of an app
 * @request GET:/v1/apps/{appid}/websites
 * @secure
 */
export async function websiteControllerFindAll(appid: string, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/websites`,
    method: 'GET',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags WebsiteHosting
 * @name WebsiteControllerFindOne
 * @summary Get a website hosting of an app
 * @request GET:/v1/apps/{appid}/websites/{id}
 * @secure
 */
export async function websiteControllerFindOne(
  appid: string,
  id: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/websites/${id}`,
    method: 'GET',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags WebsiteHosting
 * @name WebsiteControllerBindDomain
 * @summary Bind custom domain to website
 * @request PATCH:/v1/apps/{appid}/websites/{id}
 * @secure
 */
export async function websiteControllerBindDomain(
  appid: string,
  id: string,
  data: BindCustomDomainDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/websites/${id}`,
    method: 'PATCH',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags WebsiteHosting
 * @name WebsiteControllerRemove
 * @summary Delete a website hosting
 * @request DELETE:/v1/apps/{appid}/websites/{id}
 * @secure
 */
export async function websiteControllerRemove(
  appid: string,
  id: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/websites/${id}`,
    method: 'DELETE',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags WebsiteHosting
 * @name WebsiteControllerCheckResolved
 * @summary Check if domain is resolved
 * @request POST:/v1/apps/{appid}/websites/{id}/resolved
 * @secure
 */
export async function websiteControllerCheckResolved(
  appid: string,
  id: string,
  data: BindCustomDomainDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/websites/${id}/resolved`,
    method: 'POST',
    data: data,
    ...configParams,
  })
}

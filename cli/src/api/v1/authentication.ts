import { request, RequestParams } from "../../util/request";
import { AuthControllerCode2TokenParams, CreatePATDto, Pat2TokenDto } from "./data-contracts";

/**
 * No description
 *
 * @tags Authentication
 * @name AuthControllerGetSigninUrl
 * @summary Redirect to login page
 * @request GET:/v1/login
 */
export async function authControllerGetSigninUrl(configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/login`,
    method: "GET",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Authentication
 * @name AuthControllerGetSignupUrl
 * @summary Redirect to register page
 * @request GET:/v1/register
 */
export async function authControllerGetSignupUrl(configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/register`,
    method: "GET",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Authentication
 * @name AuthControllerCode2Token
 * @summary Get user token by auth code
 * @request GET:/v1/code2token
 */
export async function authControllerCode2Token(
  query: AuthControllerCode2TokenParams,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/code2token`,
    method: "GET",
    params: query,
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Authentication
 * @name AuthControllerPat2Token
 * @summary Get user token by PAT
 * @request POST:/v1/pat2token
 */
export async function authControllerPat2Token(data: Pat2TokenDto, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/pat2token`,
    method: "POST",
    data: data,
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Authentication
 * @name AuthControllerGetProfile
 * @summary Get current user profile
 * @request GET:/v1/profile
 * @secure
 */
export async function authControllerGetProfile(configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/profile`,
    method: "GET",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Authentication
 * @name PatControllerCreate
 * @summary Create a PAT
 * @request POST:/v1/pats
 * @secure
 */
export async function patControllerCreate(data: CreatePATDto, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/pats`,
    method: "POST",
    data: data,
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Authentication
 * @name PatControllerFindAll
 * @summary List PATs
 * @request GET:/v1/pats
 * @secure
 */
export async function patControllerFindAll(configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/pats`,
    method: "GET",
    ...configParams,
  });
}
/**
 * No description
 *
 * @tags Authentication
 * @name PatControllerRemove
 * @summary Delete a PAT
 * @request DELETE:/v1/pats/{id}
 * @secure
 */
export async function patControllerRemove(id: string, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/pats/${id}`,
    method: "DELETE",
    ...configParams,
  });
}

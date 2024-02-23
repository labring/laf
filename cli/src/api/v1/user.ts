import { request, RequestParams } from '../../util/request'
import { BindEmailDto, BindPhoneDto, BindUsernameDto, UserControllerGetAvatarData } from './data-contracts'

/**
 * No description
 *
 * @tags User
 * @name UserControllerGetAvatar
 * @summary Get avatar of user
 * @request GET:/v1/user/avatar/{uid}
 * @secure
 */
export async function userControllerGetAvatar(
  uid: string,
  configParams: RequestParams = {},
): Promise<UserControllerGetAvatarData> {
  return request({
    url: `/v1/user/avatar/${uid}`,
    method: 'GET',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags User
 * @name UserControllerBindPhone
 * @summary Bind phone
 * @request POST:/v1/user/bind/phone
 * @secure
 */
export async function userControllerBindPhone(data: BindPhoneDto, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/user/bind/phone`,
    method: 'POST',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags User
 * @name UserControllerBindEmail
 * @summary Bind email
 * @request POST:/v1/user/bind/email
 * @secure
 */
export async function userControllerBindEmail(data: BindEmailDto, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/user/bind/email`,
    method: 'POST',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags User
 * @name UserControllerBindUsername
 * @summary Bind username
 * @request POST:/v1/user/bind/username
 * @secure
 */
export async function userControllerBindUsername(
  data: BindUsernameDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/user/bind/username`,
    method: 'POST',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags User
 * @name UserControllerGetProfile
 * @summary Get current user profile
 * @request GET:/v1/user/profile
 * @secure
 */
export async function userControllerGetProfile(configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/user/profile`,
    method: 'GET',
    ...configParams,
  })
}

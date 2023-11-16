import { request, RequestParams } from '../../util/request'
import {
  CreatePATDto,
  PasswdCheckDto,
  PasswdResetDto,
  PasswdSigninDto,
  PasswdSignupDto,
  Pat2TokenDto,
  PhoneSigninDto,
  SendEmailCodeDto,
  SendPhoneCodeDto,
} from './data-contracts'

/**
 * No description
 *
 * @tags Authentication
 * @name UserPasswordControllerSignup
 * @summary Signup by user-password
 * @request POST:/v1/auth/passwd/signup
 */
export async function userPasswordControllerSignup(
  data: PasswdSignupDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/auth/passwd/signup`,
    method: 'POST',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Authentication
 * @name UserPasswordControllerSignin
 * @summary Signin by user-password
 * @request POST:/v1/auth/passwd/signin
 */
export async function userPasswordControllerSignin(
  data: PasswdSigninDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/auth/passwd/signin`,
    method: 'POST',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Authentication
 * @name UserPasswordControllerReset
 * @summary Reset password
 * @request POST:/v1/auth/passwd/reset
 */
export async function userPasswordControllerReset(
  data: PasswdResetDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/auth/passwd/reset`,
    method: 'POST',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Authentication
 * @name UserPasswordControllerCheck
 * @summary Check if user-password is set
 * @request POST:/v1/auth/passwd/check
 */
export async function userPasswordControllerCheck(
  data: PasswdCheckDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/auth/passwd/check`,
    method: 'POST',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Authentication
 * @name PhoneControllerSendCode
 * @summary Send phone verify code
 * @request POST:/v1/auth/phone/sms/code
 */
export async function phoneControllerSendCode(data: SendPhoneCodeDto, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/auth/phone/sms/code`,
    method: 'POST',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Authentication
 * @name PhoneControllerSignin
 * @summary Signin by phone and verify code
 * @request POST:/v1/auth/phone/signin
 */
export async function phoneControllerSignin(data: PhoneSigninDto, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/auth/phone/signin`,
    method: 'POST',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Authentication
 * @name AuthenticationControllerGetProviders
 * @summary Auth providers
 * @request GET:/v1/auth/providers
 */
export async function authenticationControllerGetProviders(configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/auth/providers`,
    method: 'GET',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Authentication
 * @name AuthenticationControllerPat2Token
 * @summary Get user token by PAT
 * @request POST:/v1/auth/pat2token
 */
export async function authenticationControllerPat2Token(
  data: Pat2TokenDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/auth/pat2token`,
    method: 'POST',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Authentication
 * @name EmailControllerSendCode
 * @summary Send email verify code
 * @request POST:/v1/auth/email/code
 */
export async function emailControllerSendCode(data: SendEmailCodeDto, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/auth/email/code`,
    method: 'POST',
    data: data,
    ...configParams,
  })
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
    method: 'POST',
    data: data,
    ...configParams,
  })
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
    method: 'GET',
    ...configParams,
  })
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
    method: 'DELETE',
    ...configParams,
  })
}

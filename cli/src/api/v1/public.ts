import { request, RequestParams } from '../../util/request'
import {
  RegionControllerGetRegionsData,
  SettingControllerGetSettingByKeyData,
  SettingControllerGetSettingsData,
} from './data-contracts'

/**
 * No description
 *
 * @tags Public
 * @name AppControllerGetRuntimes
 * @summary Get application runtime list
 * @request GET:/v1/runtimes
 */
export async function appControllerGetRuntimes(configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/runtimes`,
    method: 'GET',
    ...configParams,
  })
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
    method: 'GET',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Public
 * @name SettingControllerGetSettings
 * @summary Get site settings
 * @request GET:/v1/settings
 */
export async function settingControllerGetSettings(
  configParams: RequestParams = {},
): Promise<SettingControllerGetSettingsData> {
  return request({
    url: `/v1/settings`,
    method: 'GET',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Public
 * @name SettingControllerGetSettingByKey
 * @summary Get one site setting by key
 * @request GET:/v1/settings/{key}
 */
export async function settingControllerGetSettingByKey(
  key: string,
  configParams: RequestParams = {},
): Promise<SettingControllerGetSettingByKeyData> {
  return request({
    url: `/v1/settings/${key}`,
    method: 'GET',
    ...configParams,
  })
}

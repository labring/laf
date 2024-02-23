import { request, RequestParams } from '../../util/request'
import {
  CreateFunctionTemplateDto,
  FunctionTemplateControllerGetAllFunctionTemplateParams,
  FunctionTemplateControllerGetFunctionTemplateUsedByParams,
  FunctionTemplateControllerGetMyFunctionTemplateParams,
  FunctionTemplateControllerGetRecommendFunctionTemplateParams,
  UpdateFunctionTemplateDto,
} from './data-contracts'

/**
 * No description
 *
 * @tags FunctionTemplate
 * @name FunctionTemplateControllerCreateFunctionTemplate
 * @summary create a function template
 * @request POST:/v1/function-templates
 * @secure
 */
export async function functionTemplateControllerCreateFunctionTemplate(
  data: CreateFunctionTemplateDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/function-templates`,
    method: 'POST',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags FunctionTemplate
 * @name FunctionTemplateControllerGetAllFunctionTemplate
 * @summary get all function template
 * @request GET:/v1/function-templates
 * @secure
 */
export async function functionTemplateControllerGetAllFunctionTemplate(
  query: FunctionTemplateControllerGetAllFunctionTemplateParams,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/function-templates`,
    method: 'GET',
    params: query,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags FunctionTemplate
 * @name FunctionTemplateControllerUseFunctionTemplate
 * @summary use a function template
 * @request POST:/v1/function-templates/{templateId}/{appid}
 * @secure
 */
export async function functionTemplateControllerUseFunctionTemplate(
  templateId: string,
  appid: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/function-templates/${templateId}/${appid}`,
    method: 'POST',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags FunctionTemplate
 * @name FunctionTemplateControllerUpdateFunctionTemplate
 * @summary update a function template
 * @request PATCH:/v1/function-templates/update/{id}
 * @secure
 */
export async function functionTemplateControllerUpdateFunctionTemplate(
  id: string,
  data: UpdateFunctionTemplateDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/function-templates/update/${id}`,
    method: 'PATCH',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags FunctionTemplate
 * @name FunctionTemplateControllerDeleteFunctionTemplate
 * @summary delete a function template
 * @request DELETE:/v1/function-templates/{id}
 * @secure
 */
export async function functionTemplateControllerDeleteFunctionTemplate(
  id: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/function-templates/${id}`,
    method: 'DELETE',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags FunctionTemplate
 * @name FunctionTemplateControllerGetOneFunctionTemplate
 * @summary get one function template
 * @request GET:/v1/function-templates/{id}
 * @secure
 */
export async function functionTemplateControllerGetOneFunctionTemplate(
  id: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/function-templates/${id}`,
    method: 'GET',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags FunctionTemplate
 * @name FunctionTemplateControllerStarFunctionTemplate
 * @summary star a function template
 * @request PUT:/v1/function-templates/{templateId}/star
 * @secure
 */
export async function functionTemplateControllerStarFunctionTemplate(
  templateId: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/function-templates/${templateId}/star`,
    method: 'PUT',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags FunctionTemplate
 * @name FunctionTemplateControllerGetUserFunctionTemplateStarState
 * @summary get function template user star state
 * @request GET:/v1/function-templates/{id}/star-state
 * @secure
 */
export async function functionTemplateControllerGetUserFunctionTemplateStarState(
  id: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/function-templates/${id}/star-state`,
    method: 'GET',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags FunctionTemplate
 * @name FunctionTemplateControllerGetFunctionTemplateUsedBy
 * @summary get people who use this function template
 * @request GET:/v1/function-templates/{id}/used-by
 * @secure
 */
export async function functionTemplateControllerGetFunctionTemplateUsedBy(
  { id, ...query }: FunctionTemplateControllerGetFunctionTemplateUsedByParams,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/function-templates/${id}/used-by`,
    method: 'GET',
    params: query,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags FunctionTemplate
 * @name FunctionTemplateControllerGetMyFunctionTemplate
 * @summary get my function template
 * @request GET:/v1/function-templates/my
 * @secure
 */
export async function functionTemplateControllerGetMyFunctionTemplate(
  query: FunctionTemplateControllerGetMyFunctionTemplateParams,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/function-templates/my`,
    method: 'GET',
    params: query,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags FunctionTemplate
 * @name FunctionTemplateControllerGetRecommendFunctionTemplate
 * @summary get all recommend function template
 * @request GET:/v1/function-templates/recommend
 * @secure
 */
export async function functionTemplateControllerGetRecommendFunctionTemplate(
  query: FunctionTemplateControllerGetRecommendFunctionTemplateParams,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/function-templates/recommend`,
    method: 'GET',
    params: query,
    ...configParams,
  })
}

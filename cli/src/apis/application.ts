import { requestData } from "../utils/request"

/**
 * 根据 appid 获取应用
 * @param {string} appid
 * @returns 返回应用数据
 */
 export async function getApplicationByAppid(appid: string) {
  const res = await requestData({
      url: `/v1/applications/${appid}`,
      method: 'get'
  })   
  return res.data
 }

/**
 * 获取应用列表
 * @returns 返回应用数据
 */
 export async function listApplication() {
  const url = `/v1/applications`
  const obj = {
      method: "GET",
      url
  }
  const result = await requestData(obj)
  return result.data
}
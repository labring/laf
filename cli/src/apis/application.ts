import { requestData } from "../utils/request"

/**
 * Get application by appid
 * @param {string} appid
 * @returns
 */
 export async function getApplicationByAppid(appid: string) {
  const res = await requestData({
      url: `/v1/applications/${appid}`,
      method: 'get'
  })   
  return res.data
 }

/**
 * Get the application list
 * @returns
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
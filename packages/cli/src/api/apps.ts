import { requestData } from "./request"

/**
 * 根据 appid 获取应用
 * @param {string} appid
 * @returns 返回应用数据
 */
export async function getApplicationByAppid(appid: string) {
    const res = await requestData({
        url: `/sys-api/apps/${appid}`,
        method: 'get'
    })

    return res.data
}

/**
 * 获取应用列表
 * @returns 返回应用数据
 */
export async function appList() {
    const url = `/sys-api/apps/my`
    const obj = {
        method: "GET",
        url
    }
    const result = await requestData(obj)
    return result.data
}

/**
 * 根据 appid stop 应用
 * @param {string} appid
 * @returns 
 */
export async function appStop(appid: string) {
    const url = `/sys-api/apps/${appid}/instance/stop`
    const obj = {
        method: "POST",
        url,
    }
    const result = await requestData(obj)
    return result.data
}

/**
 * 根据 appid start 应用
 * @param {string} appid
 * @returns 
 */

export async function appStart(appid: string) {
    const url = `/sys-api/apps/${appid}/instance/start`
    const obj = {
        method: "POST",
        url
    }
    const result = await requestData(obj)
    return result.data
}


/**
 * 根据 appid restart 应用
 * @param {string} appid
 * @returns 
 */
export async function appRestart(appid: string) {
    const url = `/sys-api/apps/${appid}/instance/start`
    const obj = {
        method: "POST",
        url
    }
    const result = await requestData(obj)
    return result.data
}

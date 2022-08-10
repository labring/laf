import { requestData } from "./request"
import { getDebugToken } from "../utils/tokens"
import { getAppData } from "../utils/util"
import axios from 'axios'


/**
 * 根据 appid 同步函数
 * @param {string} appid
 * @param {string} functionName
 * @returns 
 */

export async function pullFunction(appid: string, functionName: string) {

    let url = ''
    if (functionName) {
        url = `/sys-api/apps/${appid}/function?page=1&limit=1&keyword=${functionName}`
    } else {
        url = `/sys-api/apps/${appid}/function?page=1&limit=200`
    }

    const obj = {
        method: "GET",
        url
    }

    const result = await requestData(obj)
    return result.data
}

/**
 * 调试函数
 * @param {string} functionName
 * @param {Object} obj
 * @returns 
 */
export async function debugFunction(functionName: string, obj: Object) {

    const appData = getAppData()
    const url = `${appData.endpoint}/debug/${functionName}`

    try {
        const debug_token = await getDebugToken()
        const headers = { "authorization": `Bearer ${debug_token}` }

        const result = await axios.post(url, obj, { headers: headers })
        const response = result.data
        if (response.error) {
            console.error(response.error)
            process.exit(1)
        }
        return response
    } catch (err) {
        console.error(err.message)
        process.exit(1)
    }
}

/**
 * 创建函数
 * @param {string} appid
 * @param {Object} data
 * @returns 
 */
export async function createFunction(appid: string, data: Object) {
    const url = `/sys-api/apps/${appid}/function/create`
    const obj = {
        method: "POST",
        url,
        data
    }

    const result = await requestData(obj)
    return result.data
}


/**
 * 获取函数
 * @param {string} appid
 * @param {string} functionName
 * @returns 
 */
export async function getFunctionByName(appid: string, functionName: string) {
    const url = `/sys-api/apps/${appid}/function/detail/${functionName}`
    const obj = {
        method: "GET",
        url,
    }
    const result = await requestData(obj)
    return result.data
}

/**
 * 同步函数
 * @param {string} appid
 * @param {string} functionName
  * @param {Object} data
 * @returns 
 */
export async function pushFunction(appid: string, functionName: string, data: object) {
    const url = `/sys-api/apps/${appid}/function/save/${functionName}`
    const obj = {
        method: "POST",
        url,
        data
    }

    const result = await requestData(obj)
    return result.data
}


/**
 * publish by functionName
 * @param {string} appid
 * @param {string} functionName
 * @returns 
 */

export async function publishFunction(appid: string, functionName: string) {
    const url = `/sys-api/apps/${appid}/function/publish/${functionName}`

    const obj = {
        method: "POST",
        url
    }
    const result = await requestData(obj)
    return result.data
}


/**
 * publish all function
 * @param {string} appid
 * @param {string} functionName
 * @returns 
 */
export async function publishAllFunction(appid: string) {
    const url = `/sys-api/apps/${appid}/function/publish`

    const obj = {
        method: "POST",
        url
    }
    const result = await requestData(obj)
    return result.data
}



/**
 * 编辑函数
 * @param {string} appid
 * @param {string} functionId
 * @returns 
 */
export async function editFunction(appid: string, functionId: string, data: any) {
    const url = `/sys-api/apps/${appid}/function/${functionId}/info`

    const obj = {
        method: "POST",
        url,
        data
    }
    const result = await requestData(obj)
    return result.data
}

/**
 * 删除函数
 * @param {string} appid
 * @param {string} functionId
 * @returns 
 */
export async function deleteFunction(appid: string, functionId: string) {
    const url = `/sys-api/apps/${appid}/function/${functionId}`

    const obj = {
        method: "DELETE",
        url
    }
    const result = await requestData(obj)
    return result.data
}
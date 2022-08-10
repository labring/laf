import { requestData } from "./request"


/**
 * 根据 appid 同步数据
 * @param {string} appid
 * @returns
 */
export async function syncApp(appid: string) {
    const url = `/sys-api/apps/${appid}/export`
    const obj = {
        method: "GET",
        url,
        responseType: 'stream',
    }

    return await requestData(obj)
}
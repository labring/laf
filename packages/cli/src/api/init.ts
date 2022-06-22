import { requestData } from "./request"


export async function initApi(appid: string) {

    const url = `/sys-api/apps/${appid}/export`
    const obj = {
        method: "GET",
        url,
        responseType: 'stream',
    }

    return await requestData(obj)
}
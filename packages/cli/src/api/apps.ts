import { requestData } from "./request"

export async function appList() {
    const url = `/sys-api/apps/my`
    const obj = {
        method: "GET",
        url
    }
    const result = await requestData(obj)
    return result.data
}

export async function appStop(appid: string) {
    const url = `/sys-api/apps/${appid}/instance/stop`
    const obj = {
        method: "POST",
        url,
    }
    const result = await requestData(obj)
    return result.data
}

export async function appStart(appid: string) {
    const url = `/sys-api/apps/${appid}/instance/start`
    const obj = {
        method: "POST",
        url
    }
    const result = await requestData(obj)
    return result.data
}


export async function appRestart(appid: string) {
    const url = `/sys-api/apps/${appid}/instance/start`
    const obj = {
        method: "POST",
        url
    }
    const result = await requestData(obj)
    return result.data
}

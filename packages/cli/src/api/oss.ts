import { requestData } from "./request"

/**
 * 根据 appid 同步数据
 * @param {string} appid
 * @param {string} bucketName
 * @returns
 */
export async function detail(appid: string, bucketName: string) {

    const url = `/sys-api/apps/${appid}/oss/buckets/${bucketName}`
    const obj = {
        method: "GET",
        url,
    }

    const result = await requestData(obj)
    return result.data
}

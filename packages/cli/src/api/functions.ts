import { requestData } from "./request"


export async function pullFunction(appid: string,functionName:string) {

    let url = ''

    if(functionName){
        url = `/sys-api/apps/${appid}/function?status=1&page=1&limit=100&keyword=${functionName}`
    }else{
        url = `/sys-api/apps/${appid}/function?status=1&page=1&limit=100`

    }
    const obj = {
        method: "GET",
        url
    }

    const result = await requestData(obj)
    return result.data
}
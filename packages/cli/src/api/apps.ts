import {requestData }from "./request"

import { getAccessToken } from "../utils/tokens"


export async function appList() {
    const url = `/sys-api/apps/my`;
    const access_token = await getAccessToken();
    const obj =  {
        method:"GET",
        url,
        headers:{
            authorization:`Bearer ${access_token}`,
        }
    }
    return await requestData(obj)
}



export async function appStop(appid:string) {
    const url = `/sys-api/apps/${appid}/instance/stop`;
    const access_token = await getAccessToken();
    const obj =  {
        method:"POST",
        url,
        headers:{
            authorization:`Bearer ${access_token}`,
        }
    }
    return await requestData(obj)
}



export async function appStart(appid:string) {
    const url = `/sys-api/apps/${appid}/instance/start`;
    const access_token = await getAccessToken();
    const obj =  {
        method:"POST",
        url,
        headers:{
            authorization:`Bearer ${access_token}`,
        }
    }
    return await requestData(obj)
}


export async function appRestart(appid:string) {
    const url = `/sys-api/apps/${appid}/instance/start`;
    const access_token = await getAccessToken();
    const obj =  {
        method:"POST",
        url,
        headers:{
            authorization:`Bearer ${access_token}`,
        }
    }
    return await requestData(obj)
}

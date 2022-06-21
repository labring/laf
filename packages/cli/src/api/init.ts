import {requestData }from "./request"

import { getAccessToken } from "../utils/tokens";


export async function initapi(appid:string) {

    const url = `/sys-api/apps/${appid}/export`;

    const access_token = await getAccessToken();

    console.log(access_token)


    const obj =  {
        method:"GET",
        url,
        responseType: 'stream',
        headers:{
            authorization:`Bearer ${access_token}`,
        }
    }

    return await requestData(obj)
}
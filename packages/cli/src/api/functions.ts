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

/**
 * 调试函数
 * @param {string} appid
 * @param {string} functionName
 * @param {Object} obj
 * @returns 
 */

export async function debugFunction(appid: string,functionName:string,obj:Object) {

    const appData = getAppData();

    const url = `http://${appid}.${appData.endPoint}/debug/${functionName}`

    try{

        const debug_token = await getDebugToken()
        const headers ={"authorization":`Bearer ${debug_token}`}

        const result = await axios.post(url,obj,{headers:headers})

        const response =  result.data

        return response

    }catch(err){
        
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

export async function createFunction(appid: string,data:Object) {


    const  url= `/sys-api/apps/${appid}/function/create`

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

export async function getFunctionByName(appid: string,functionName:string) {
    const  url= `/sys-api/apps/${appid}/function/getFunction/${functionName}`
    const obj = {
        method: "GET",
        url,
    }
   const result = await requestData(obj)
   return result.data
}

/**
 *  同步函数
 * @param {string} appid
 * @param {string} functionName
  * @param {Object} data
 * @returns 
 */


export async function pushFunction(appid: string,functionName:string,data:object) {
    const  url= `/sys-api/apps/${appid}/function/updateFunction/${functionName}`

    const obj = {
        method: "POST",
        url,
        data
    }

   const result = await requestData(obj)
   return result.data
}


/**
 * 发布函数
 * @param {string} appid
 * @param {string} functionName
 * @returns 
 */

export async function publishFunction(appid: string,functionName:string) {
    const  url= `/sys-api/apps/${appid}/function/publishFunction/${functionName}`

    const obj = {
        method: "POST",
        url
    }
   const result = await requestData(obj)
   return result.data
}
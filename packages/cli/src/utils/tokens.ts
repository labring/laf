
import * as fs from 'node:fs'
import { AUTH_FILE } from '../utils/constants'
import { getApplicationByAppid } from '../api/apps'
import { getAppData } from './util'


/**
 * get access token
 * @returns
 */
export async function getAccessToken() {
    // read data
    const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'))

    // check if expire
    const currentTime = Math.floor(Date.now() / 1000)
    if (currentTime > authData.expire_time) {
        return null
    }

    return authData.access_token
}


/**
 * get debug token
 * @returns
 */
export async function getDebugToken() {
    const appData = getAppData()
    const response = await getApplicationByAppid(appData.appid)
    return response.data.debug_token
}


import * as fs from 'node:fs'
import * as path from 'node:path'
import { CREDENTIALS_DIR, AUTH_FILE, LAF_FILE } from '../utils/constants'
import { getApplicationByAppid } from '../api/apps'


/**
 * get access token
 * @returns
 */

export async function getAccessToken() {

    try {
        // check dir
        fs.accessSync(CREDENTIALS_DIR, fs.constants.R_OK | fs.constants.W_OK)
    } catch (err) {
        console.error("please login first ")
        process.exit(1)
    }

    // read data
    const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'))

    // check if expire
    const currentTime = Math.floor(Date.now() / 1000)
    if (currentTime > authData.expire_time) {
        console.log("access_token expire,please login")
        process.exit(1)
    }

    return authData.access_token
}


/**
 * get debug token
 * @returns
 */
export async function getDebugToken() {

    const appFile = path.resolve(process.cwd(), LAF_FILE)
    const appData = JSON.parse(fs.readFileSync(appFile, 'utf8'))
    const response = await getApplicationByAppid(appData.appid)
    return response.data.debug_token

}

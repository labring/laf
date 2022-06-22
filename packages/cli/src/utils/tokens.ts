
import * as fs from 'node:fs'

import { CREDENTIALS_DIR, AUTH_FILE } from '../utils/constants'

export async function getAccessToken() {

    try {
        // check dir
        fs.accessSync(CREDENTIALS_DIR, fs.constants.R_OK | fs.constants.W_OK)
    } catch (err) {
        console.error("please login first")
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

// debug token

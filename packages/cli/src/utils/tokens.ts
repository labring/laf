
import * as fs from 'node:fs'

import {AUTH_FILE} from '../utils/constants'

export async function getAccessToken(){
    const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));

    const currentTime =  Math.floor(Date.now() / 1000)
    if(currentTime>authData.expire_time){
        console.log("access_token expire,please login")
        process.exit(1)
    }

    return  authData.access_token
}

// debug token

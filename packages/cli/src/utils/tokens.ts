
import * as fs from 'node:fs'

import {AUTH_FILE} from '../config/config'

export async function getAccessToken(){
    const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    return  authData.access_token
}

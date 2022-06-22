import {loginApi} from '../api/user'
import * as fs from 'node:fs'
import {AUTH_FILE} from '../utils/constants'
import { checkCredentialsDir } from '../utils/util'

export async function loginCommand(remote:string,username:string,password:string) {

    // check auth dir
    checkCredentialsDir()

    // login
    const result = await loginApi(remote,{username,password})

    if(!result){
        console.error('username or password is wrong')
        process.exit(1)
    }
    const content = {access_token:result.access_token,expire_time:result.expire_time,remote:remote}
    
    // write to file
    fs.writeFileSync(AUTH_FILE, JSON.stringify(content))
    console.log(`Generated: ${AUTH_FILE}`)
    
}
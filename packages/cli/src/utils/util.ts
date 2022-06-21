import * as fs from 'node:fs'
import {CREDENTIALS_DIR} from './constants'
import {AUTH_FILE} from '../utils/constants'

export function checkCredentialsDir(){

    try{
        fs.accessSync(CREDENTIALS_DIR, fs.constants.R_OK|fs.constants.W_OK)
    }catch(err){
        fs.mkdirSync(CREDENTIALS_DIR, { recursive: true })
    }
    
}

export function getRemoteServe(){

    const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    return  authData.remote
}

   
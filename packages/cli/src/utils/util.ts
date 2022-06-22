import * as fs from 'node:fs'
import {CREDENTIALS_DIR} from './constants'
import {AUTH_FILE} from '../utils/constants'

export function checkCredentialsDir(){

    try{
        // check dir
        fs.accessSync(CREDENTIALS_DIR, fs.constants.R_OK|fs.constants.W_OK)
    }catch(err){
        // mkdir
        fs.mkdirSync(CREDENTIALS_DIR, { recursive: true })
    }
    
}

export function getRemoteServe(){

    try{
        // check dir
        fs.accessSync(CREDENTIALS_DIR, fs.constants.R_OK|fs.constants.W_OK)
    }catch(err){
        console.error("please login first")
        process.exit(1)
    }

    const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    return  authData.remote
}

   
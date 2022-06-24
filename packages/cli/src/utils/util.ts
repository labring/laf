import * as fs from 'node:fs'
import  * as path  from 'node:path'
import {CREDENTIALS_DIR} from './constants'
import {AUTH_FILE} from '../utils/constants'

// check auth dir
export function checkCredentialsDir(){

    try{
        // check dir
        fs.accessSync(CREDENTIALS_DIR, fs.constants.R_OK|fs.constants.W_OK)
    }catch(err){
        // mkdir
        fs.mkdirSync(CREDENTIALS_DIR, { recursive: true })
    }
    
}

export function checkDir(dir:string){
    try{
        // check dir
        fs.accessSync(dir, fs.constants.R_OK|fs.constants.W_OK)
    }catch(err){
        // mkdir
        fs.mkdirSync(dir, { recursive: true })
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


export function getAppFunctions(dir:string){
    let arrFiles = []
    const files = fs.readdirSync(dir)
    for (let i = 0; i < files.length; i++) {

      const item = files[i]

      const itemDir = path.resolve(dir,item)

      const stat = fs.lstatSync(itemDir)
      if (stat.isDirectory() === true) {
        arrFiles.push(item)
      } 
    }
    return arrFiles;
}

   
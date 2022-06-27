import * as fs from 'node:fs'
import  * as path  from 'node:path'
import { CREDENTIALS_DIR } from './constants'
import { AUTH_FILE,LAF_FILE,FUNCTIONS_DIR } from '../utils/constants'

/**
 * check auth dir
 */
export function checkCredentialsDir(){

    try{
        // check dir
        fs.accessSync(CREDENTIALS_DIR, fs.constants.R_OK|fs.constants.W_OK)
    }catch(err){
        // mkdir
        fs.mkdirSync(CREDENTIALS_DIR, { recursive: true })
    }
    
}

/**
 * check dir
 * @param {string} dir
 */
export function checkDir(dir:string){
    try{
        // check dir
        fs.accessSync(dir, fs.constants.R_OK|fs.constants.W_OK)
    }catch(err){
        // mkdir
        fs.mkdirSync(dir, { recursive: true })
    }

}


/**
 * get all funtions in app functions dir
 * @returns
 */

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


/**
 * check dir
 * @param {string} functionName
 */

export function checkFuncNameDir(functionName:string){

    const functionsDir = path.resolve(process.cwd(), FUNCTIONS_DIR)
    checkDir(functionsDir)
    const functions = getAppFunctions(functionsDir)
    if(functionName){
        if(!functions.includes(functionName)){
            console.error('function not exist')
            process.exit(1)
        }
    }

}


/**
 * get remote server in AUTH_FILE
 * @returns
 */

export function getRemoteServe(){

    try{
        // check dir
        fs.accessSync(CREDENTIALS_DIR, fs.constants.R_OK|fs.constants.W_OK)
    }catch(err){
        console.error("please login first 3")
        process.exit(1)
    }
    const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    return  authData.remote
}


/**
 * get app data in LAF_FILE
 * @returns
 */

export function getAppData(){

    try{
        const appFile = path.resolve(process.cwd(), LAF_FILE)
        // check file
        fs.accessSync(appFile, fs.constants.R_OK|fs.constants.W_OK)
        const appData = JSON.parse(fs.readFileSync(appFile, 'utf8'))
        return appData
    }catch(err){
        console.error("cant find laf.json")
        process.exit(1)
    }

}

   
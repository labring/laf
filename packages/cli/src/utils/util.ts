import * as fs from 'node:fs'
import * as path from 'node:path'
import { CREDENTIALS_DIR, DEFAULT_SERVER, PROJECT_DIR } from './constants'
import { AUTH_FILE, LAF_CONFIG_FILE, FUNCTIONS_DIR } from '../utils/constants'
import * as AWS from 'aws-sdk'

/**
 * check auth dir
 */
export function checkCredentialsDir() {
    try {
        // check dir
        fs.accessSync(CREDENTIALS_DIR, fs.constants.R_OK | fs.constants.W_OK)
    } catch (err) {
        // mkdir
        fs.mkdirSync(CREDENTIALS_DIR, { recursive: true })
    }
}

/**
 * Ensure directory exists
 * @param {string} dir
 */
export function ensureDirectory(dir: string) {
    try {
        fs.accessSync(dir, fs.constants.R_OK | fs.constants.W_OK)
    } catch (err) {
        fs.mkdirSync(dir, { recursive: true })
    }
}

/**
 * Ensure home config file exists
 */
export function ensureHomeConfig() {
    if (fs.existsSync(CREDENTIALS_DIR)) {
        return
    }

    fs.mkdirSync(CREDENTIALS_DIR, { recursive: true })

    const content = {
        access_token: null,
        expire_time: null,
        remote: DEFAULT_SERVER
    }
    fs.writeFileSync(AUTH_FILE, JSON.stringify(content))
}

/**
 * get all funtions in app functions dir
 * @returns
 */

/**
 * get all funtions in app functions dir
 * @returns
 */

export function getAppFunctions(dir: string) {
    let arrFiles = []
    const files = fs.readdirSync(dir)
    for (let i = 0; i < files.length; i++) {

        const item = files[i]

        const itemDir = path.resolve(dir, item)

        const stat = fs.lstatSync(itemDir)
        if (stat.isDirectory() === true) {
            arrFiles.push(item)
        }
    }
    return arrFiles
}


/**
 * check dir
 * @param {string} functionName
 */

export function checkFuncNameDir(functionName: string) {

    const functionsDir = path.resolve(PROJECT_DIR, FUNCTIONS_DIR)

    const functions = getAppFunctions(functionsDir)
    if (!functions.includes(functionName)) {
        console.error('function not exist')
        process.exit(1)
    }
}


/**
 * get remote server in `AUTH_FILE`
 * @returns
 */

export function getRemoteServer() {
    const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'))
    return authData.remote
}


/**
 * get app data in LAF_FILE
 * @returns
 */
export function getAppData(): { appid: string, endpoint: string, oss_endpoint: string } {
    try {
        const appFile = path.resolve(process.cwd(), LAF_CONFIG_FILE)
        // check file
        fs.accessSync(appFile, fs.constants.R_OK | fs.constants.W_OK)
        const appData = JSON.parse(fs.readFileSync(appFile, 'utf8'))
        return appData
    } catch (err) {
        console.error("cant find laf.json, please run `laf init` first")
        process.exit(1)
    }
}

/**
 * get s3 client
 * @param endpoint 
 * @param credentials 
 * @returns 
 */
export function getS3Client(endpoint: string, credentials: any) {

    return new AWS.S3({
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
        endpoint: endpoint,
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
        region: 'us-east-1'
    })

}


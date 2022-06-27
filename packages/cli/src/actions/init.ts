import * as fs from 'node:fs'
import * as path from 'node:path'
import { LAF_FILE } from '../utils/constants'
import { checkDir } from '../utils/util'

import * as AdmZip from 'adm-zip'
import { pipeline } from 'node:stream/promises'


/**
 * init app
 * @param {string} appName
 * @param {string} appid
 * @param {string} endPoint
 * @returns
 */

export async function handleInitAppCommand(appName:string,appid:string,endPoint:string) {

    const appPath = path.resolve(process.cwd(), appName)
    checkDir(appPath)
    const lafFile = path.resolve(appPath, LAF_FILE)
    // write data
    fs.writeFileSync(lafFile, JSON.stringify({ appid: appid, root: appPath ,endPoint}))
    
}


/**
 * sync app
 * @param {string} appName
 * @param {any} data
 * @returns
 */

export async function handleSyncAppCommand(appName:string,data:any) {

    const appPath = path.resolve(process.cwd(), appName)

    const appZip = appName + '.zip'
    const appZipPath = path.resolve(process.cwd(), appZip)
    const writer = fs.createWriteStream(appZipPath)
    await pipeline(data.data,writer);

    // unzip
    const file = new AdmZip(appZipPath)
    file.extractAllTo(appPath)

    fs.unlinkSync(appZipPath)
    console.log('success')
    
}
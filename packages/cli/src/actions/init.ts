import { PROJECT_DIR } from './../utils/constants'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { LAF_CONFIG_FILE } from '../utils/constants'
import { ensureDirectory } from '../utils/util'

import * as AdmZip from 'adm-zip'
import { pipeline } from 'node:stream/promises'


/**
 * init app
 * @param {string} appid
 * @param {string} endpoint
 * @param {string} oss_endpoint
 */

export async function handleInitAppCommand(appid: string, endpoint: string, oss_endpoint: string) {
    fs.writeFileSync(LAF_CONFIG_FILE, JSON.stringify({ appid: appid, endpoint: endpoint, oss_endpoint: oss_endpoint }))
}


/**
 * sync app
 * @returns
 */

export async function handleSyncAppCommand(appid: string, data: any) {
    ensureDirectory(PROJECT_DIR)

    // download app zip
    const appZipPath = path.resolve(process.cwd(), `${appid}.zip`)
    const writer = fs.createWriteStream(appZipPath)
    await pipeline(data.data, writer)

    // unzip
    const file = new AdmZip(appZipPath)
    file.extractAllTo(PROJECT_DIR)

    fs.unlinkSync(appZipPath)
    console.log('success')

}
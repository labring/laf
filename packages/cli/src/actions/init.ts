import * as path from 'node:path'
import * as fs from 'node:fs'
import { GLOBAL_FILE, PACKAGE_FILE, PROJECT_DIR, RESPONSE_FILE, TEMPLATES_DIR, TSCONFIG_FILE, TYPE_DIR } from './../utils/constants'
import { LAF_CONFIG_FILE } from '../utils/constants'
import { ensureDirectory } from '../utils/util'
import { handlePullListCommand } from './function-pull-list'


/**
 * init app
 * @param {string} appid
 * @param {string} endpoint
 * @param {string} oss_endpoint
 */
export async function handleInitAppCommand(appid: string, endpoint: string, oss_endpoint: string) {
    // add laf.json to project
    fs.writeFileSync(LAF_CONFIG_FILE, JSON.stringify({ appid: appid, endpoint: endpoint, oss_endpoint: oss_endpoint }))

    // add config file
    addConfigFromTemplates()
}


/**
 * sync app
 * @returns
 */

export async function handleSyncAppCommand(appid: string) {
    ensureDirectory(PROJECT_DIR)

    // pull functions
    await handlePullListCommand(appid, [])
}

function addConfigFromTemplates() {
    ensureDirectory(TYPE_DIR)

    // from templates dir
    const templates_dir = path.resolve(__dirname, '../../', TEMPLATES_DIR)

    // generate global.d.ts
    const from_globle_file = path.resolve(templates_dir, GLOBAL_FILE)
    const out_globe_file = path.resolve(TYPE_DIR, GLOBAL_FILE)
    fs.writeFileSync(out_globe_file, fs.readFileSync(from_globle_file, 'utf-8'))

    // generate response.d.ts
    const from_response_file = path.resolve(templates_dir, RESPONSE_FILE)
    const out_response_file = path.resolve(TYPE_DIR, RESPONSE_FILE)
    fs.writeFileSync(out_response_file, fs.readFileSync(from_response_file, 'utf-8'))

    // generate package.json
    const from_package_file = path.resolve(templates_dir, PACKAGE_FILE)
    const out_package_file = path.resolve(PROJECT_DIR, PACKAGE_FILE)
    fs.writeFileSync(out_package_file, fs.readFileSync(from_package_file, 'utf-8'))

    // generate tsconfig.json
    const from_tsconfig_file = path.resolve(templates_dir, TSCONFIG_FILE)
    const out_tsconfig_file = path.resolve(PROJECT_DIR, TSCONFIG_FILE)
    fs.writeFileSync(out_tsconfig_file, fs.readFileSync(from_tsconfig_file, 'utf-8'))

}
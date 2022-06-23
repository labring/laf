
import { program } from 'commander'
import { initApi } from './api/init'
import * as fs from 'node:fs'
import * as AdmZip from 'adm-zip'
import * as path from 'node:path'

import { LAF_FILE } from './utils/constants'

import { checkDir } from './utils/util'

program
    .command('init <appid>')
    .option('-s, --sync', 'sync app', false)
    .action(async (appid, options) => {

        try {

            // get app
            const result = await initApi(appid)

            // get app name
            const appName = result.headers['content-disposition'].slice(22, -5)

            const appPath = path.resolve(process.cwd(), appName)

            checkDir(appPath)
            const lafFile = path.resolve(appName, LAF_FILE)

            // write data
            fs.writeFileSync(lafFile, JSON.stringify({ appid: appid, root: "@laf" ,endPoint:""}))

            console.log('save success')

            // sync app data
            if (options.sync) {

                 // add app data to zip
                const appZip = appName + '.zip'
                const appZipPath = path.resolve(process.cwd(), appZip)
                const writer = fs.createWriteStream(appZipPath)
                result.data.pipe(writer)
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve)
                    writer.on('error', reject)
                })

                // unzip
                const file = new AdmZip(appZipPath)
                file.extractAllTo(appPath)
            }
        }
        catch (err) {
            console.log(err.message)
        }

    })

program.parse(process.argv)

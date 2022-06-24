
import { program } from 'commander'
import {initApi} from './api/init'
import * as fs from 'node:fs'
import * as AdmZip from 'adm-zip'
import  * as path  from 'node:path'

import {LAF_FILE} from './config/config'

program
    .command('init <appid>')
    .option('-s, --sync', 'sync app', false)
    .action(async ( appid,options) => {
    
        try{
            
            const result = await initApi(appid)

            const appname = result.headers['content-disposition'].slice(22,-5);

            const appPath = path.resolve(process.cwd(), appName)

            try{
                fs.accessSync(apppath, fs.constants.R_OK|fs.constants.W_OK)
            }catch(err){
                fs.mkdir(apppath, { recursive: true }, (err) => {
                    if (err) throw err;
                });
            }
            const lafFile  = path.resolve(appname, LAF_FILE)
    
            fs.writeFile(lafFile, JSON.stringify({appid:appid,root:"@laf"}),{ flag: 'w+' },(err) => {
                if (err) throw err;
                console.log('save,success');
              })

            if(options.sync){

                const appzip = appname+'.zip'

                const appzippath = path.resolve(process.cwd(), appzip)

                const writer = fs.createWriteStream(appzippath)

                result.data.pipe(writer)
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve)
                    writer.on('error', reject)
                })

                const file = new AdmZip(appzippath);

                file.extractAllTo(apppath)
            }
        }
        catch(err){
            console.log(err.message)
        }
   
  });

program.parse(process.argv);

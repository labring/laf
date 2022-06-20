
const { Command } = require('commander');
const request = require('axios')
const path  = require('path')
const fs = require('fs')
const AdmZip = require('adm-zip');
const program = new Command();
const homedir=  require("os").homedir()
const CREDENTIALs_file = '.laf-credentials/auth.json';
const envFile = path.resolve(homedir, CREDENTIALs_file)
const authData = JSON.parse(fs.readFileSync(envFile, 'utf8'));
const access_token =  authData.access_token


program
    .command('init <appid>')
    .option('-s, --sync', 'sync app', false)
    .action(async ( appid,options) => {
        const url = `https://www.lafyun.com/sys-api/apps/${appid}/export`;
        try{
            const result = await request({
                method:"GET",
                url,
                responseType: 'stream',
                headers:{
                    authorization:`Bearer ${access_token}`,
                }
            })

            const appname = result.headers['content-disposition'].slice(22,-5);

            const apppath = path.resolve(process.cwd(), appname)

            try{
                fs.accessSync(apppath, fs.constants.R_OK|fs.constants.W_OK)
            }catch(err){
                fs.mkdir(apppath, { recursive: true }, (err) => {
                    if (err) throw err;
                });
            }
            const lafFile  = path.resolve(appname, 'laf.json')
    
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

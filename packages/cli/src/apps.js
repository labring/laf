
const { Command } = require('commander');
const request = require('axios')
const path  = require('path')
const fs = require('fs')
const dotenv = require('dotenv'); 

const Table = require('cli-table2')

const homedir=  require("os").homedir()
const CREDENTIALs_file = '.laf-credentials/auth.json';
const envFile = path.resolve(homedir, CREDENTIALs_file)
const authData = JSON.parse(fs.readFileSync(envFile, 'utf8'));
const access_token =  authData.access_token

const program = new Command();

program
.command('list')
.option('--env <env-file>', `the file name to generate`, '.env')
.action(async ( options) => {
    const url = `https://www.lafyun.com/sys-api/apps/my`;
    const result = await request({
        method:"GET",
        url,
        headers:{
            authorization:`Bearer ${access_token}`,
        }
    })
    const response = result.data;

    if(response.data){
        const table = new Table({
            head: ['APPId', 'name','status'],
        });
    
        response.data.created.forEach(app => {
            table.push([app.appid,app.name,app.status])
        });

        response.data.joined.forEach(app => {
            table.push([app.appid,app.name,app.status])
        });

        console.log(table.toString())
    }

});

program
.command('stop <appid>')
.option('--env <env-file>', `the file name to generate`, '.env')
.action(async (appid,options) => {

    const url = `https://www.lafyun.com/sys-api/apps/${appid}/instance/stop`;
    const result = await request({
        method:"POST",
        url,
        headers:{
            authorization:`Bearer ${access_token}`,
        }
    })
    const response = result.data;

    if(response.data.result){
        console.log('stop success')
    }else{
        console.log('stop failed')
    }
});


program
.command('start <appid>')
.option('--env <env-file>', `the file name to generate`, '.env')
.action(async (appid,options) => {
    
    const url = `https://www.lafyun.com/sys-api/apps/${appid}/instance/start`;
    const result = await request({
        method:"POST",
        url,
        headers:{
            authorization:`Bearer ${access_token}`,
        }
    })
    const response = result.data;

    if(response.data.result){
        console.log('start success')
    }else{
        console.log('start failed')
    }
});


program
.command('restart <appid>')
.option('--env <env-file>', `the file name to generate`, '.env')
.action(async (appid,options) => {

    const url = `https://www.lafyun.com/sys-api/apps/${appid}/instance/restart`;
    const result = await request({
        method:"POST",
        url,
        headers:{
            authorization:`Bearer ${access_token}`,
        }
    })
    const response = result.data;

    if(response.data.result){
        console.log('restart success')
    }else{
        console.log('restart failed')
    }
});

program.parse(process.argv);

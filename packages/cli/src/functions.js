
const { Command } = require('commander');
const request = require('axios')
const path  = require('path')
const fs = require('fs')

const ts =  require('typescript')


const jwt =  require( 'jsonwebtoken')
const DEFAULT_SALT = 'Rewrite_Your_Own_Secret_Salt_abcdefg1234567'

function getToken(payload) {
    return jwt.sign(payload, DEFAULT_SALT)
}


function compileTs2js(source) {
    const jscode = ts.transpile(source, {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2017,
      removeComments: true,
    })
  
    return jscode
  }


const homedir=  require("os").homedir()
const CREDENTIALs_file = '.laf-credentials/auth.json';
const envFile = path.resolve(homedir, CREDENTIALs_file)
const authData = JSON.parse(fs.readFileSync(envFile, 'utf8'));
const access_token =  authData.access_token

const appFile = path.resolve(process.cwd(), 'laf.json')
const appData = JSON.parse(fs.readFileSync(appFile, 'utf8'));


const program = new Command();
program
.command('fn-pull')
.argument('[function-name]',"funct")
.option('-f, --force-overwrite', 'force to updated all files ignore if modified', false)
.option('--env <env-file>', `the file name to generate`, '../.env')
.action(async ( functionName,options) => {
   
    let url = '';

    if(functionName){
        url = `https://www.lafyun.com/sys-api/apps/${appData.appid}/function?status=1&page=1&limit=100&keyword=${functionName}`
    }else{
        url = `https://www.lafyun.com/sys-api/apps/${appData.appid}/function?status=1&page=1&limit=100`

    }

    const result = await request({
        method:"GET",
        url,
        headers:{
            authorization:`Bearer ${access_token}`,
        }
    })
    const response = result.data;

    console.log(response.data)

    const functionsDir = path.resolve(process.cwd(), 'functions')
    
    response.data.forEach(element => {
        const funcName =element.name;
        const funcFile = funcName+'/test.ts'
        const funcPath = path.resolve(functionsDir, funcFile)
        fs.writeFile(funcPath, element.code, err => {
            if (err) {
              console.error(err)
              return
            }
            console.log('pull success')
          })
    });


});



program
.command('fn-invork')
.argument('[function-name]',"function-name")
.action(async ( functionName,options) => {

    const functionsDir = path.resolve(process.cwd(), 'functions')

    const functions = getAllFunctions(functionsDir)
    
    if(functionName){
        if(!functions.includes(functionName)){
            console.error('function not exist')
            process.exit(1)
        }

    }

    console.log(functionName)

    const funcFile= path.resolve(functionsDir, `${functionName}/index.ts`)


    console.log(funcFile)

    const  code = fs.readFileSync(funcFile, 'utf8')

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24
    
    const appid = appData.appid;

    const token = getToken({ appid, type: 'debug', exp })

    console.log(token)

    try{

        const url = `https://${appData.appid}.lafyun.com/debug/${functionName}`

        const result = await request({
            method:"POST",
            url,
            headers:{
                authorization:`Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBpZCI6InZnMnA3NSIsInR5cGUiOiJkZWJ1ZyIsImV4cCI6MTY1NTcwMzUzMiwiaWF0IjoxNjU1NjE3MTMyfQ.aWc3SGiA4MAfv9-Uso9jb-83SP5DXeNRzYVzMvoByRk`,
            },
            data:{
                func:{
                    appid: appid,
                    code: code,
                    compiledCode: compileTs2js(code),
                    debugParams: "{\n  \"code\": \"laf\"\n}",
            },
                param:{code:"laf"}
            }
        })

        console.log(result.data)

    } catch(e){

        console.log(e.message)

    }

});



program
.command('fn-push')
.argument('[function-name]',"function-name")
.action(async ( functionName,options) => {

    const functionsDir = path.resolve(process.cwd(), 'functions')

    const functions = getAllFunctions(functionsDir)
    
    if(functionName){
        if(!functions.includes(functionName)){
            console.error('function not exist')
            process.exit(1)
        }

    }

    console.log(functionName)

    const funcFile= path.resolve(functionsDir, `${functionName}/index.ts`)


    console.log(funcFile)

    const  code = fs.readFileSync(funcFile, 'utf8')


    const metaFile = functionName+'/meta.json'
    const metaFilePath = path.resolve(functionsDir, metaFile)

    const metaData = JSON.parse(fs.readFileSync(metaFilePath, 'utf8'));

    // 读取远程函数列表 判读函数是否存在


    const url = `https://www.lafyun.com/sys-api/apps/${appData.appid}/function/${metaData.id}/code`

        const result = await request({
            method:"POST",
            url,
            headers:{
                authorization:`Bearer ${access_token}`,
            },
            data:{
                code:code.toString()
            }
        })

        console.log(result.data)

});




program
.command('fn-pub')
.argument('[function-name]',"function-name")
.option('-a, --all', 'force to updated all files ignore if modified', false)
.action(async ( functionName,options) => {

    const functionsDir = path.resolve(process.cwd(), 'functions')

    const functions = getAllFunctions(functionsDir)
    let publishFunctions = [];
    if(functionName){
        if(!functions.includes(functionName)){
            console.error('function not exist')
            process.exit(1)
        }

        publishFunctions.push(functionName)

    }else{

        publishFunctions = functions;
    }

    publishFunctions.forEach(async(item) =>{

        const metaFile = item+'/meta.json'
        const metaFilePath = path.resolve(functionsDir, metaFile)

        const metaData = JSON.parse(fs.readFileSync(metaFilePath, 'utf8'));

        console.log(metaData)

        const url = `https://www.lafyun.com/sys-api/apps/${appData.appid}/function/${metaData.id}/publish`

        const result = await request({
            method:"POST",
            url,
            headers:{
                authorization:`Bearer ${access_token}`,
            }
        })
        console.log(result.data)

    })

});




program.parse(process.argv);

function getAllFunctions(dir){
    let arrFiles = []
    const files = fs.readdirSync(dir)
    for (let i = 0; i < files.length; i++) {
      const item = files[i]
      const stat = fs.lstatSync(dir + '\\' + item)
      if (stat.isDirectory() === true) {
        arrFiles.push(item)
      } 
    }
    return arrFiles;
}
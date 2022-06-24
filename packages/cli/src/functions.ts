
import { program } from 'commander'
import  * as path  from 'node:path'
import * as fs from 'node:fs'
import { pullFunction } from './api/functions'

import { LAF_FILE , FUNCTIONS_DIR ,FUNCTIONS_FILE} from './utils/constants'
import { checkDir } from './utils/util'
 
const appFile = path.resolve(process.cwd(), LAF_FILE)
const appData = JSON.parse(fs.readFileSync(appFile, 'utf8'))

program
.command('fn-pull')
.argument('[function-name]',"functionname")
.option('-f, --force-overwrite', 'force to  file ignore if modified', false)
.action(async ( functionName,options) => {
   
    // pull function
    const response =await pullFunction(appData.appid,functionName)

    if(response.total){

         // functions dir
        const functionsDir = path.resolve(process.cwd(), FUNCTIONS_DIR)

        checkDir(functionsDir)

        response.data.forEach(element => {

            //fuction name
            const funcName =element.name;
            const funcNameDir = path.resolve(functionsDir, funcName)
    
            checkDir(funcNameDir)
    
            const funcFile= path.resolve(funcNameDir, FUNCTIONS_FILE)
            try{
                // check if exist function file
                fs.accessSync(funcFile)
                const currentCode =fs.readFileSync(funcFile,'utf-8')
                
                if(currentCode){
                    // forceOverwrite
                    if(options.forceOverwrite){
                        fs.writeFileSync(funcFile, element.code)
                    }
                }else{
                    fs.writeFileSync(funcFile, element.code)
                }
            }catch(err){
    
                fs.writeFileSync(funcFile, element.code)
    
            }
            
            console.log('pull success')
        })

    }else{

        console.log('functions not find')
    }

})


program.parse(process.argv);


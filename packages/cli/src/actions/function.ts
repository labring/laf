
import  * as path  from 'node:path'
import * as fs from 'node:fs'
import { compileTs2js } from '../utils/util-lang'

import { FUNCTIONS_DIR ,FUNCTIONS_FILE} from '../utils/constants'
import { checkDir} from '../utils/util'

import { debugFunction,getFunctionByName,pushFunction,createFunction} from '../api/functions'



/**
 * pull function
 * @param {any} data
 * @param {any} options
 * @returns
 */

export async function handlePullFunctionCommand(data:any,options:any) {

    // functions dir
    const functionsDir = path.resolve(process.cwd(), FUNCTIONS_DIR)

    checkDir(functionsDir)

    data.forEach(element => {

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

    
}

/**
 * invoke function
 * @param {string} appid
 * @param {string} functionName
 * @param {object} param
 * @returns
 */

export async function handleInvokeFunctionCommand(appid:string,functionName:string,param:object) {

    const functionsDir = path.resolve(process.cwd(), FUNCTIONS_DIR)

    // get local code
    const functionNameDir = path.resolve(functionsDir, functionName)
    const funcFile= path.resolve(functionNameDir, FUNCTIONS_FILE)
    const code = fs.readFileSync(funcFile, 'utf8')
    const obj = {
        func:{
            appid: appid,
            code: code,
            name:functionName,
            compiledCode: compileTs2js(code),
            debugParams: JSON.stringify(param),
        },
        param:param
    }

    const res = await debugFunction(functionName,obj)
    console.log(res)

}


/**
 * push fuction
 * @param {string} appid
 * @param {string} functionName
 * @param {any} options
 * @returns
 */


export async function handlePushFunctionCommand(appid:string,functionName:string,options:any) {

    const functionsDir = path.resolve(process.cwd(), FUNCTIONS_DIR)

    // get local code
    const functionNameDir = path.resolve(functionsDir, functionName)
    const funcFile= path.resolve(functionNameDir, FUNCTIONS_FILE)
    const  code = fs.readFileSync(funcFile, 'utf8')
    
    // get function
    const record = await getFunctionByName(appid,functionName)
    
    //update function
    if(record.data){
        if(record.data.code!==code){
    
            if(options.forceOverwrite){
                const data = {
                    code:code,
                    debugParams:JSON.stringify({"code":"laf"}),
                }
                const res = await pushFunction(appid,functionName,data)
                if(res.data){
                    console.log("push success")
                }
            }else{

                console.log("romote code is different with local")
            }
        }else{
            console.log("romote code is same with local")
        }
    
    }else{
        // create function
        const data = {
            code:code,
            name:functionName,
            label:"test",
            status:1
        }
    
        const res = await createFunction(appid,data)
        if(res.data){
            console.log("push success")
        }     
    }
    
}
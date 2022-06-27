
import { program } from 'commander'
import { pullFunction   ,getFunctionByName ,publishFunction } from './api/functions'
import {  getAppData,checkFuncNameDir } from './utils/util'
import { handlePullFunctionCommand,handleInvokeFunctionCommand ,handlePushFunctionCommand} from './actions/functionAction'
 
const appData = getAppData()

program
.command('fn-pull')
.argument('[function-name]',"functionname")
.option('-f, --force-overwrite', 'force to  file ignore if modified', false)
.action(async ( functionName,options) => {
    // pull function
    const response =await pullFunction(appData.appid,functionName)
    if(response.total){
       await handlePullFunctionCommand(response.data,options)
    }else{
        console.log('functions not find')
    }
})

program
.command('fn-invoke')
.argument('function-name',"functionname")
.argument('[param]','function param','{}')
.action(async ( functionName,param) => {

    try{
        const debugParams= JSON.parse(param)
         // check function
        checkFuncNameDir(functionName)
        await handleInvokeFunctionCommand(appData.appid,functionName,debugParams)

    }catch(err){
        console.error(err.message)
        process.exit(1)

    }
    
})


program
.command('fn-push')
.argument('function-name',"functionname")
.option('-f, --force-overwrite', 'force to  file ignore if modified', false)
.action(async ( functionName,options) => {
    // check fucntion
    checkFuncNameDir(functionName)

    await handlePushFunctionCommand(appData.appid,functionName,options)

})


program
.command('fn-publish')
.argument('function-name',"functionname")
.action(async ( functionName) => {

    // get function
    const record = await getFunctionByName(appData.appid,functionName)

    if(record.data){
        // publish function
        const res = await publishFunction(appData.appid,functionName)
        if(res.code==0){
            console.log('publish success')
        }
    }else{
        console.log('funtion not exist')
    }

})


program.parse(process.argv);


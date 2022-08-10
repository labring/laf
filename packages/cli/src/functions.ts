
import { Command } from 'commander'
import { getFunctionByName, publishAllFunction, publishFunction } from './api/functions'
import { getAppData, checkFuncNameDir, ensureDirectory } from './utils/util'
import { handleInvokeFunctionCommand } from './actions/function-invoke'
import { handlePullOneCommand } from './actions/function-pull-one'
import { handlePullListCommand } from './actions/function-pull-list'
import { handlePushOneCommand } from './actions/funtcion-push-one'
import { handlePushListCommand } from './actions/function-push-list'
import { FUNCTIONS_DIR } from './utils/constants'

export function makeFnCommand() {
    const fn = new Command('fn')

    fn
        .command('pull')
        .argument('[function-name]', "functionname")
        .option('-f, --force-overwrite', 'force to  file ignore if modified', false)
        .action(async (functionName, options) => {
            const appData = getAppData()

            if (functionName) {
                await handlePullOneCommand(appData.appid, functionName)
            } else {
                await handlePullListCommand(appData.appid, options)
            }
        })

    fn
        .command('invoke')
        .argument('function-name', "functionname")
        .argument('[param]', 'function param', '{}')
        .action(async (functionName, param) => {
            const appData = getAppData()

            try {
                const debugParams = JSON.parse(param)
                // check function
                checkFuncNameDir(functionName)

                await handleInvokeFunctionCommand(appData.appid, functionName, debugParams)
            } catch (err) {
                console.error(err.message)
                process.exit(1)
            }
        })


    fn
        .command('push')
        .argument('[function-name]', "functionname")
        .option('-f, --force-overwrite', 'force to  file ignore if modified', false)
        .action(async (functionName, options) => {
            const appData = getAppData()
            if (functionName) {
                checkFuncNameDir(functionName)
                handlePushOneCommand(appData.appid, functionName)
            } else {
                ensureDirectory(FUNCTIONS_DIR)
                handlePushListCommand(appData.appid, options)
            }
        })


    fn
        .command('publish')
        .argument('[function-name]', "functionname")
        .action(async (functionName) => {
            const appData = getAppData()
            if (functionName) {
                // get function
                const record = await getFunctionByName(appData.appid, functionName)

                if (record.data) {
                    // publish function
                    const res = await publishFunction(appData.appid, functionName)
                    if (res.code == 0) {
                        console.log(`${functionName} publish success`)
                    }
                } else {
                    console.log(`${functionName} funtion not exist`)
                }
            } else {
                const result = await publishAllFunction(appData.appid)

                if (result.code == 0) {
                    console.log('publish success')
                }
            }
        })

    return fn
}


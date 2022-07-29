import * as path from 'node:path'
import * as fs from 'node:fs'
import { compileTs2js } from '../utils/util-lang'
import { PROJECT_DIR } from '../utils/constants'
import { FUNCTIONS_DIR, FUNCTIONS_FILE } from '../utils/constants'
import { debugFunction } from '../api/functions'

/**
 * invoke function
 * @param {string} appid
 * @param {string} functionName
 * @param {object} param
 * @returns
 */
export async function handleInvokeFunctionCommand(appid: string, functionName: string, param: object) {

    // get local code
    const functionNameDir = path.resolve(PROJECT_DIR, FUNCTIONS_DIR, functionName)
    const funcFile = path.resolve(functionNameDir, FUNCTIONS_FILE)
    const code = fs.readFileSync(funcFile, 'utf8')
    const obj = {
        func: {
            appid: appid,
            code: code,
            name: functionName,
            compiledCode: compileTs2js(code),
            debugParams: JSON.stringify(param),
        },
        param: param
    }

    const res = await debugFunction(functionName, obj)
    console.log(res)
}
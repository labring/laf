import { PROJECT_DIR } from './../utils/constants'

import * as path from 'node:path'
import * as fs from 'node:fs'
import { compileTs2js } from '../utils/util-lang'

import { FUNCTIONS_DIR, FUNCTIONS_FILE } from '../utils/constants'
import { ensureDirectory } from '../utils/util'

import { debugFunction, getFunctionByName, pushFunction, createFunction } from '../api/functions'



/**
 * pull function
 * @param {any} data
 * @param {any} options
 * @returns
 */

export async function handlePullFunctionCommand(data: any, options: any) {

    // functions dir
    const functionsDir = path.resolve(PROJECT_DIR, FUNCTIONS_DIR)

    ensureDirectory(functionsDir)

    data.forEach(element => {

        //fuction name
        const funcName = element.name
        const funcNameDir = path.resolve(functionsDir, funcName)
        ensureDirectory(funcNameDir)

        const funcFile = path.resolve(funcNameDir, FUNCTIONS_FILE)

        // create function file if not exists
        const file_existed = fs.existsSync(funcFile)
        if (!file_existed) {
            fs.writeFileSync(funcFile, element.code)
            console.log(`${funcName} created`)
            return
        }

        // force update function file if force option is true
        const currentCode = fs.readFileSync(funcFile, 'utf-8')
        if (options.forceOverwrite) {
            fs.writeFileSync(funcFile, element.code)
            console.log(`${funcName} updated`)
            return
        }

        // update function file if code is empty
        if (!currentCode) {
            fs.writeFileSync(funcFile, element.code)
            console.log(`${funcName} updated`)
            return
        }

        console.log(`${funcName} unchanged`)
    })
}

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


/**
 * push fuction
 * @param {string} appid
 * @param {string} functionName
 * @param {any} options
 * @returns
 */
export async function handlePushFunctionCommand(appid: string, functionName: string, options: any) {

    const functionsDir = path.resolve(PROJECT_DIR, FUNCTIONS_DIR)

    // get local code
    const functionNameDir = path.resolve(functionsDir, functionName)
    const funcFile = path.resolve(functionNameDir, FUNCTIONS_FILE)
    const code = fs.readFileSync(funcFile, 'utf8')

    // get remote function
    const record = await getFunctionByName(appid, functionName)

    // create function if not exists
    if (!record.data) {
        // create function
        const data = {
            code: code,
            name: functionName,
            label: functionName,
            status: 1,
            compiledCode: compileTs2js(code),
            debugParams: '{}',
        }

        const res = await createFunction(appid, data)
        if (res.data) {
            console.log("push success")
        }
        return
    }

    // update function if code is different
    if (record.data.code !== code) {
        const data = {
            code: code,
            debugParams: JSON.stringify({ "code": "laf" }),
        }
        const res = await pushFunction(appid, functionName, data)
        if (res.data) {
            console.log("push success")
        }
    }
}
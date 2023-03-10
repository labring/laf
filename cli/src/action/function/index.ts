import { CompileFunctionDto, CreateFunctionDto, UpdateFunctionDto } from '../../api/v1/data-contracts'
import {
  functionControllerCompile,
  functionControllerCreate,
  functionControllerFindAll,
  functionControllerFindOne,
  functionControllerRemove,
  functionControllerUpdate,
  logControllerGetLogs,
} from '../../api/v1/function'
import { readApplicationConfig } from '../../config/application'
import {
  existFunctionConfig,
  FunctionConfig,
  readFunctionConfig,
  removeFunctionConfig,
  writeFunctionConfig,
} from '../../config/function'
import * as path from 'node:path'
import * as fs from 'node:fs'
import * as Table from 'cli-table3'
import { formatDate } from '../../util/format'
import { readSecretConfig } from '../../config/secret'
import { invokeFunction } from '../../api/debug'
import { exist, remove } from '../../util/file'
import { getEmoji } from '../../util/print'
import { getApplicationPath } from '../../util/sys'
import { FUNCTIONS_DIRECTORY_NAME } from '../../common/constant'
import { confirm } from '../../common/prompts'

export async function create(
  funcName: string,
  options: {
    websocket: boolean
    methods: ('GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD')[]
    tags: string[]
    description: string
  },
) {
  const appConfig = readApplicationConfig()
  const createDto: CreateFunctionDto = {
    name: funcName,
    description: options.description,
    websocket: options.websocket,
    methods: options.methods,
    code: `\nimport cloud from '@lafjs/cloud'\n\nexports.main = async function (ctx: FunctionContext) {\n  console.log('Hello World')\n  return { data: 'hi, laf' }\n}\n`,
    tags: options.tags,
  }
  await functionControllerCreate(appConfig.appid, createDto)
  pullOne(funcName)
  console.log(`${getEmoji('✅')} function ${funcName} created`)
}

export async function list() {
  const appConfig = readApplicationConfig()
  const funcs = await functionControllerFindAll(appConfig.appid)
  const table = new Table({
    head: ['name', 'desc', 'websocket', 'methods', 'tags', 'updatedAt'],
  })
  for (let func of funcs) {
    table.push([
      func.name,
      func.description,
      func.websocket,
      func.methods.join(','),
      func.tags.join(','),
      formatDate(func.updatedAt),
    ])
  }
  console.log(table.toString())
}

export async function del(funcName: string) {
  const appConfig = readApplicationConfig()
  await functionControllerRemove(appConfig.appid, funcName)
  if (existFunctionConfig(funcName)) {
    removeFunctionConfig(funcName)
  }
  const funcPath = path.join(process.cwd(), 'functions', funcName + '.ts')
  if (exist(funcPath)) {
    remove(funcPath)
  }
  console.log(`${getEmoji('✅')} function ${funcName} deleted`)
}

async function pull(funcName: string) {
  const appConfig = readApplicationConfig()
  const func = await functionControllerFindOne(appConfig.appid, funcName)
  const funcConfig: FunctionConfig = {
    name: func.name,
    description: func.description,
    websocket: func.websocket,
    methods: func.methods,
    tags: func.tags,
  }
  writeFunctionConfig(func.name, funcConfig)
  const codePath = path.join(process.cwd(), 'functions', func.name + '.ts')
  fs.writeFileSync(codePath, func.source.code)
}

export async function pullAll() {
  const appConfig = readApplicationConfig()
  const funcs = await functionControllerFindAll(appConfig.appid)
  for (let func of funcs) {
    await pull(func.name)
    console.log(`${getEmoji('✅')} function ${func.name} pulled`)
  }
}

export async function pullOne(funcName: string) {
  await pull(funcName)
  console.log(`${getEmoji('✅')} function ${funcName} pulled`)
}

async function push(funcName: string, isCreate: boolean) {
  const appConfig = readApplicationConfig()
  const funcConfig = readFunctionConfig(funcName)
  const codePath = path.join(process.cwd(), 'functions', funcName + '.ts')
  const code = fs.readFileSync(codePath, 'utf-8')
  if (isCreate) {
    const createDto: CreateFunctionDto = {
      name: funcName,
      description: funcConfig.description || '',
      websocket: funcConfig.websocket,
      methods: funcConfig.methods as any,
      code,
      tags: funcConfig.tags,
    }
    await functionControllerCreate(appConfig.appid, createDto)
  } else {
    const updateDto: UpdateFunctionDto = {
      description: funcConfig.description || '',
      websocket: funcConfig.websocket,
      methods: funcConfig.methods as any,
      code,
      tags: funcConfig.tags,
    }
    await functionControllerUpdate(appConfig.appid, funcName, updateDto)
  }
}

export async function pushAll(options: { force: boolean }) {
  const appConfig = readApplicationConfig()
  const serverFuncs = await functionControllerFindAll(appConfig.appid)
  const serverFuncMap = new Map<string, FunctionConfig>()
  for (let func of serverFuncs) {
    serverFuncMap.set(func.name, func)
  }
  const localFuncs = getLocalFuncs()
  for (let item of localFuncs) {
    await push(item, !serverFuncMap.has(item))
    console.log(`${getEmoji('✅')} function ${item} pushed`)
  }

  const localFuncMap = new Map<string, boolean>()
  for (let item of localFuncs) {
    localFuncMap.set(item, true)
  }

  // delete server functions
  for (let item of serverFuncs) {
    if (!localFuncMap.has(item.name)) {
      if (options.force) {
        await functionControllerRemove(appConfig.appid, item.name)
        console.log(`${getEmoji('✅')} function ${item.name} deleted`)
      } else {
        const res = await confirm('confirm remove function ' + item.name + '?')
        if (res.value) {
          await functionControllerRemove(appConfig.appid, item.name)
          console.log(`${getEmoji('✅')} function ${item.name} deleted`)
        } else {
          console.log(`${getEmoji('🎃')} cancel remove function ${item.name}`)
        }
      }
    }
  }

  console.log(`${getEmoji('✅')} all functions pushed`)
}

export async function pushOne(funcName: string) {
  const appConfig = readApplicationConfig()
  const serverFuncs = await functionControllerFindAll(appConfig.appid)
  let isCreate = true
  for (let func of serverFuncs) {
    if (func.name === funcName) {
      isCreate = false
      break
    }
  }
  await push(funcName, isCreate)
  console.log(`${getEmoji('✅')} function ${funcName} pushed`)
}

export async function exec(funcName: string, options: {
  log: string;
  requestId: boolean,
  method: string,
  query: string,
  data: string,
  headers: any,
}) {
  // compile code
  const codePath = path.join(process.cwd(), 'functions', funcName + '.ts')
  if (!exist(codePath)) {
    console.error(`${getEmoji('❌')} function ${funcName} not found, please pull or create it!`)
    process.exit(1)
  }
  const code = fs.readFileSync(codePath, 'utf-8')
  const compileDto: CompileFunctionDto = {
    code,
  }
  const appConfig = readApplicationConfig()
  const func = await functionControllerCompile(appConfig.appid, funcName, compileDto)
  // invoke debug
  const secretConfig = readSecretConfig()

  // transform headers json string to object. -H '{"Content-Type": "application/json"}' 
  if (options.headers) {
    try {
      options.headers = JSON.parse(options.headers)
    } catch (e) {
      options.headers = {}
    }
  }

  // transform data json string to object. eg -d '{"key": "val"}' or  -d 'key=val'
  if (options.data) {
    try {
      options.data = JSON.parse(options.data)
    } catch (e) {
      options.data = options.data
    }
  }

  const res = await invokeFunction(
    appConfig.invokeUrl || '',
    secretConfig?.functionSecretConfig?.debugToken,
    funcName,
    func,
    options.method,
    options.query,
    options.data,
    options.headers,
  )

  // print requestId
  if (options.requestId) {
    console.log(`requestId: ${res.requestId}`)
  }

  // print response
  console.log(res.res)

  // print log
  if (options.log) {
    await printLog(appConfig.appid, res.requestId, options.log)
  }
}

async function printLog(appid: string, requestId: string, limit: string) {
  const data = await logControllerGetLogs({
    appid,
    requestId,
    limit: limit,
  })
  for (let log of data.list) {
    console.log(`[${formatDate(log.createdAt)}] ${log.data}`)
  }
}

function getLocalFuncs() {
  const funcDir = path.join(getApplicationPath(), FUNCTIONS_DIRECTORY_NAME)
  const files = fs.readdirSync(funcDir)
  const funcs = files.filter((file) => file.endsWith('.ts')).map((file) => file.replace('.ts', ''))
  return funcs
}

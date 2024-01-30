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
import * as path from 'node:path'
import * as fs from 'node:fs'
import * as Table from 'cli-table3'
import { formatDate } from '../../util/format'
import { invokeFunction } from '../../api/debug'
import { exist, remove } from '../../util/file'
import { getEmoji } from '../../util/print'
import { getBaseDir } from '../../util/sys'
import { FUNCTION_SCHEMA_DIRECTORY } from '../../common/constant'
import { confirm } from '../../common/prompts'
import { AppSchema } from '../../schema/app'
import { FunctionSchema } from '../../schema/function'
import * as urlencode from 'urlencode'
import { lstatSync } from 'fs'

export async function create(
  funcName: string,
  options: {
    websocket: boolean
    methods: ('GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD')[]
    tags: string[]
    description: string
  },
) {
  const appSchema = AppSchema.read()
  const createDto: CreateFunctionDto = {
    name: funcName,
    description: options.description,
    methods: options.methods,
    code: `\nimport cloud from '@lafjs/cloud'\n\nexport default async function (ctx: FunctionContext) {\n  console.log('Hello World')\n  return { data: 'hi, laf' }\n}\n`,
    tags: options.tags,
  }
  await functionControllerCreate(appSchema.appid, createDto)
  pullOne(funcName)
  console.log(`${getEmoji('✅')} function ${funcName} created`)
}

export async function list() {
  const appSchema = AppSchema.read()
  const funcs = await functionControllerFindAll(appSchema.appid)
  const table = new Table({
    head: ['name', 'desc', 'websocket', 'methods', 'tags', 'updatedAt'],
  })
  for (const func of funcs) {
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
  const appSchema = AppSchema.read()
  await functionControllerRemove(appSchema.appid, urlencode(funcName))
  if (FunctionSchema.exist(funcName)) {
    FunctionSchema.delete(funcName)
  }
  const funcPath = path.join(getBaseDir(), 'functions', funcName + '.ts')
  if (exist(funcPath)) {
    remove(funcPath)
  }
  console.log(`${getEmoji('✅')} function ${funcName} deleted`)
}

async function pull(funcName: string) {
  const appSchema = AppSchema.read()
  const func = await functionControllerFindOne(appSchema.appid, urlencode(funcName))
  const functionSchema: FunctionSchema = {
    name: func.name,
    desc: func.desc,
    methods: func.methods,
    tags: func.tags,
  }
  FunctionSchema.write(func.name, functionSchema)
  const codePath = path.join(getBaseDir(), 'functions', func.name + '.ts')
  fs.writeFileSync(codePath, func.source.code)
}

export async function pullAll(options: { force: boolean }) {
  const appSchema = AppSchema.read()
  const funcs = await functionControllerFindAll(appSchema.appid)
  const serverFuncMap = new Map<string, boolean>()
  for (const func of funcs) {
    await pull(func.name)
    console.log(`${getEmoji('✅')} function ${func.name} pulled`)
    serverFuncMap.set(func.name, true)
  }
  // remove remote not exist function
  const localFuncs = getLocalFuncs()
  for (const item of localFuncs) {
    if (!serverFuncMap.has(item)) {
      if (options.force) {
        removeFunction(item)
        console.log(`${getEmoji('✅')} function ${item} deleted`)
      } else {
        const res = await confirm('confirm remove function in local ' + item + '?')
        if (res.value) {
          removeFunction(item)
          console.log(`${getEmoji('✅')} function ${item} deleted`)
        }
      }
    }
  }
}

export async function pullOne(funcName: string) {
  await pull(funcName)
  console.log(`${getEmoji('✅')} function ${funcName} pulled`)
}

async function push(funcName: string, isCreate: boolean) {
  const appSchema = AppSchema.read()
  const funcSchema = FunctionSchema.read(funcName)
  const codePath = path.join(getBaseDir(), 'functions', funcName + '.ts')
  const code = fs.readFileSync(codePath, 'utf-8')
  if (isCreate) {
    const createDto: CreateFunctionDto = {
      name: funcName,
      description: funcSchema.desc || '',
      methods: funcSchema.methods as any,
      code,
      tags: funcSchema.tags,
    }
    await functionControllerCreate(appSchema.appid, createDto)
  } else {
    const updateDto: UpdateFunctionDto = {
      description: funcSchema.desc || '',
      methods: funcSchema.methods as any,
      code,
      tags: funcSchema.tags,
    }
    await functionControllerUpdate(appSchema.appid, urlencode(funcName), updateDto)
  }
}

export async function pushAll(options: { force: boolean }) {
  const appSchema = AppSchema.read()
  const serverFuncs = await functionControllerFindAll(appSchema.appid)
  const serverFuncMap = new Map<string, FunctionSchema>()
  for (const func of serverFuncs) {
    serverFuncMap.set(func.name, func)
  }
  const localFuncs = getLocalFuncs()
  for (const item of localFuncs) {
    await push(item, !serverFuncMap.has(item))
    console.log(`${getEmoji('✅')} function ${item} pushed`)
  }

  const localFuncMap = new Map<string, boolean>()
  for (const item of localFuncs) {
    localFuncMap.set(item, true)
  }

  // delete server functions
  for (const item of serverFuncs) {
    if (!localFuncMap.has(item.name)) {
      if (options.force) {
        await functionControllerRemove(appSchema.appid, urlencode(item.name))
        console.log(`${getEmoji('✅')} function ${item.name} deleted`)
      } else {
        const res = await confirm('confirm remove function ' + item.name + '?')
        if (res.value) {
          await functionControllerRemove(appSchema.appid, urlencode(item.name))
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
  const appSchema = AppSchema.read()
  const serverFuncs = await functionControllerFindAll(appSchema.appid)
  let isCreate = true
  for (const func of serverFuncs) {
    if (func.name === funcName) {
      isCreate = false
      break
    }
  }
  await push(funcName, isCreate)
  console.log(`${getEmoji('✅')} function ${funcName} pushed`)
}

export async function exec(
  funcName: string,
  options: {
    log: string
    requestId: boolean
    method: string
    query: string
    data: string
    headers: any
  },
) {
  // compile code
  const codePath = path.join(getBaseDir(), 'functions', funcName + '.ts')
  if (!exist(codePath)) {
    console.error(`${getEmoji('❌')} function ${funcName} not found, please pull or create it!`)
    process.exit(1)
  }
  const code = fs.readFileSync(codePath, 'utf-8')
  const compileDto: CompileFunctionDto = {
    code,
  }
  const appSchema = AppSchema.read()
  const func = await functionControllerCompile(appSchema.appid, urlencode(funcName), compileDto)

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
    appSchema.invokeUrl || '',
    appSchema?.function?.developToken,
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
    await printLog(appSchema.appid, res.requestId)
  }
}

async function printLog(appid: string, requestId: string) {
  const data = await logControllerGetLogs({
    appid,
    requestId,
    page: '1',
    pageSize: '100',
  })
  for (const log of data.list) {
    console.log(`[${formatDate(log.createdAt)}] ${log.data}`)
  }
}

function getLocalFuncs(): string[] {
  const funcDir = path.join(getBaseDir(), FUNCTION_SCHEMA_DIRECTORY)
  const funcs = getLocalFunction(funcDir, '')
  return funcs
}

function getLocalFunction(dir: string, prefix: string): string[] {
  const files = fs.readdirSync(dir)
  const funcNames: string[] = []
  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = lstatSync(filePath)
    if (stat.isDirectory()) {
      funcNames.push(...getLocalFunction(filePath, path.join(prefix || '', file)))
    }
    if (stat.isFile() && file.endsWith('.ts')) {
      funcNames.push(
        path
          .join(prefix || '', file)
          .replace(/\\/g, '/')
          .replace(/\.ts$/, ''),
      )
    }
  })
  return funcNames
}

function removeFunction(name: string) {
  if (FunctionSchema.exist(name)) {
    FunctionSchema.delete(name)
  }
  const funcPath = path.join(getBaseDir(), 'functions', name + '.ts')
  if (exist(funcPath)) {
    remove(funcPath)
  }
}

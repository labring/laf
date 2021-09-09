import assert = require("assert")
import { compileTs2js } from "cloud-function-engine/dist/utils"
import { ClientSession } from "mongodb"
import { ApplicationStruct } from "../api/application"
import { FunctionStruct } from "../api/function"
import { getPolicyByName, PolicyStruct } from "../api/policy"
import { Constants } from "../constants"
import { hashFunctionCode } from "../utils/hash"
import { DatabaseAgent } from "./db-agent"
import { getFunctionByName } from '../api/function'
import { generateRandString } from "../utils/rand"

/**
 * Import application definition from json object:
 * - cloud functions
 * - policies
 */
export class ApplicationImporter {
  readonly app: ApplicationStruct
  private _data: any = {}

  private functions: FunctionStruct[] = []
  private policies: PolicyStruct[] = []

  constructor(app: ApplicationStruct, data: any) {
    assert.ok(app, 'empty app got')
    assert.ok(data, 'empty data got')

    this.app = app
    this._data = data
  }

  parse() {
    this.parseFunctions()
    this.parsePolicies()
  }

  async import() {
    const accessor = DatabaseAgent.sys_accessor
    const session = accessor.conn.startSession()

    try {
      await session.withTransaction(async () => {
        // import functions
        for (const func of this.functions)
          await this.importFunction(func, session)

        // import policies
        for (const policy of this.policies)
          await this.importPolicy(policy, session)
      })
    } finally {
      await session.endSession()
    }
  }

  private async importFunction(func: FunctionStruct, session: ClientSession) {
    const db = DatabaseAgent.sys_accessor.db
    const exists = await getFunctionByName(this.app.appid, func.name)
    if (exists) {
      func.name = func.name + '__' + generateRandString(8, true, false)
    }

    const r = await db.collection(Constants.cn.functions)
      .insertOne(func as any, { session })

    return r.insertedId
  }

  private async importPolicy(policy: PolicyStruct, session: ClientSession) {
    const db = DatabaseAgent.sys_accessor.db
    const exists = await getPolicyByName(this.app.appid, policy.name)
    if (exists) {
      policy.name = policy.name + '__' + generateRandString(8, true, false)
    }

    const r = await db.collection(Constants.cn.policies)
      .insertOne(policy as any, { session })

    return r.insertedId
  }

  private parseFunctions() {
    const funcs = this._data?.functions ?? []
    this.functions = funcs.map(func => this.parseFunction(func))
  }

  private parseFunction(func: any) {
    // check function
    assert.ok(func, 'function data cannot be empty')
    assert.ok(func.name, 'name of function cannot be empty')
    assert.ok(func.code, 'code of function cannot be empty')

    const data: FunctionStruct = {
      name: func.name,
      code: func.code,
      label: func.label || func.name,
      hash: func.hash || hashFunctionCode(func.code),
      tags: func.tags || [],
      description: func.description || '',
      enableHTTP: func.enableHTTP || false,
      status: func.status || 0,
      triggers: func.triggers || [],
      debugParams: func.debugParams,
      version: func.version || 0,
      created_at: Date.now(),
      updated_at: Date.now(),
      created_by: this.app.created_by,
      compiledCode: compileTs2js(func.code),
      appid: this.app.appid,
      _id: undefined
    }

    return data
  }

  private parsePolicies() {
    const policies = this._data?.policies ?? []
    this.policies = policies.map(po => this.parsePolicy(po))
  }

  private parsePolicy(po: any) {
    // check policy
    assert.ok(po, 'policy data cannot be empty')
    assert.ok(po.name, 'policy name cannot be empty')
    assert.ok(po.rules, 'policy rules cannot be empty')

    const data: PolicyStruct = {
      name: po.name,
      description: po.description,
      status: po.status,
      rules: po.rules,
      injector: po.injector ?? null,
      hash: po.hash,
      created_at: Date.now(),
      updated_at: Date.now(),
      created_by: this.app.created_by,
      appid: this.app.appid,
      _id: undefined
    }

    return data
  }
}
import assert = require("assert")

import { ClientSession } from "mongodb"
import * as AdmZip from 'adm-zip'
import { ApplicationStruct, getApplicationDbAccessor } from "./application"
import { CloudFunctionStruct } from "./function"
import { getPolicyByName, PolicyStruct } from "./policy"
import { Constants } from "../constants"
import { DatabaseAgent } from "../db"
import { getFunctionByName } from './function'
import { generateRandString, hashFunctionCode } from "./util-passwd"
import { compileTs2js } from "./util-lang"
import { BUCKET_ACL, MinioAgent } from "./oss"


interface AppMeta {
  name: string
  version: string
  buckets: {
    name: string
    mode: BUCKET_ACL
  }[]
  packages: {
    name: string
    version: string
  }[]
}

interface CollectionStructure {
  name: string
  options: any
  indexes: {
    key: any
    background?: boolean
    unique?: boolean
  }[]
}

/**
 * Import application definition from json object:
 * - cloud functions
 * - policies
 */
export class ApplicationImporter {
  readonly app: ApplicationStruct
  private zip: AdmZip

  public meta: AppMeta
  private functions: CloudFunctionStruct[] = []
  private policies: PolicyStruct[] = []
  private collections: CollectionStructure[] = []

  /**
   * 
   * @param app the app
   * @param data 
   */
  constructor(app: ApplicationStruct, data: Buffer) {
    assert.ok(app, 'empty app got')
    assert.ok(data, 'empty data got')

    this.app = app
    this.zip = new AdmZip(data)
  }

  /**
   * Parse the app
   */
  parse() {
    this.parseMeta()
    this.parseFunctions()
    this.parsePolicies()
    this.parseCollections()
  }

  /**
   * Import the app
   */
  async import() {
    const accessor = DatabaseAgent.sys_accessor
    const session = accessor.conn.startSession()

    try {
      await session.withTransaction(async () => {
        // import packages 
        const packages = this.meta.packages || []
        for (const pkg of packages)
          await this.importPackage(pkg.name, pkg.version, session)

        // import buckets
        const buckets = this.meta.buckets || []
        for (const bucket of buckets)
          await this.importBucket(bucket.name, bucket.mode, session)

        // import functions
        for (const func of this.functions)
          await this.importFunction(func, session)

        // import policies
        for (const policy of this.policies)
          await this.importPolicy(policy, session)

        // import collections
        const collections = this.collections || []
        for (const collection of collections)
          await this.importCollection(collection)
      })
    } finally {
      await session.endSession()
    }
  }

  private parseMeta() {
    const str = this.zip.readAsText('app.json')
    this.meta = JSON.parse(str)
  }

  private parseFunctions() {
    const funcs = this.zip.getEntries()
      .filter(c => c.entryName.startsWith('functions/') && c.entryName.endsWith('/meta.json'))
      .map(c => {
        const str = this.zip.readAsText(c)
        const func = JSON.parse(str)
        assert.ok(func.name, 'name of function cannot be empty')
        const code = this.zip.readAsText(`functions/${func.name}/index.ts`)
        return { ...func, code }
      })

    this.functions = funcs.map(func => this.parseFunction(func))
  }

  private parseFunction(func: any) {
    // check function
    assert.ok(func, 'function data cannot be empty')
    assert.ok(func.name, 'name of function cannot be empty')
    assert.ok(func.code, 'code of function cannot be empty')

    const data: CloudFunctionStruct = {
      name: func.name,
      code: func.code,
      label: func.label || func.name,
      hash: func.hash || hashFunctionCode(func.code),
      tags: func.tags || [],
      description: func.description || '',
      enableHTTP: func.enableHTTP || false,
      status: func.status || 0,
      triggers: this.parseTriggers(func),
      debugParams: func.debugParams,
      version: func.version || 0,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: this.app.created_by,
      compiledCode: compileTs2js(func.code),
      appid: this.app.appid,
      _id: undefined
    }

    return data
  }

  private parseTriggers(func_data: any) {
    const triggers = func_data.triggers
    if (!triggers) return []
    for (const tri of triggers) {
      assert.ok(tri._id, `got empty trigger id of function ${func_data.name}`)
      assert.ok(tri.type, `got empty trigger type of function ${func_data.name}`)
      tri['status'] = tri['status'] || 0
    }
    return triggers
  }

  private parsePolicies() {
    const policies = this.zip.getEntries()
      .filter(c => c.entryName.startsWith('policies/') && c.entryName.endsWith('.json'))
      .map(c => {
        const str = this.zip.readAsText(c)
        const po = JSON.parse(str)
        return po
      })

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
      created_at: new Date(),
      updated_at: new Date(),
      created_by: this.app.created_by,
      appid: this.app.appid,
      _id: undefined
    }

    return data
  }

  private parseCollections() {
    const collections = this.zip.getEntries()
      .filter(c => c.entryName.startsWith('collections/') && c.entryName.endsWith('.json'))
      .map(c => {
        const str = this.zip.readAsText(c)
        return JSON.parse(str)
      })

    this.collections = collections
  }

  private async importFunction(func: CloudFunctionStruct, session: ClientSession) {
    const db = DatabaseAgent.sys_accessor.db

    // rename function if same named one exists
    const exists = await getFunctionByName(this.app.appid, func.name)
    if (exists) {
      func.name = func.name + '__' + generateRandString(8, true, false)
    }

    const r = await db.collection(Constants.colls.functions)
      .insertOne(func as any, { session })

    return r.insertedId
  }

  private async importPolicy(policy: PolicyStruct, session: ClientSession) {
    const db = DatabaseAgent.sys_accessor.db
    const exists = await getPolicyByName(this.app.appid, policy.name)
    if (exists) {
      policy.name = policy.name + '__' + generateRandString(8, true, false)
    }

    const r = await db.collection(Constants.colls.policies)
      .insertOne(policy as any, { session })

    return r.insertedId
  }

  private async importPackage(name: string, version: string, session: ClientSession) {
    const db = DatabaseAgent.sys_accessor.db

    // check if package existed
    const packages = this.app.packages ?? []
    const existed = packages?.filter(pkg => pkg.name === name)?.length
    if (existed) return

    const r = await db.collection<ApplicationStruct>(Constants.colls.applications)
      .updateOne(
        { appid: this.app.appid },
        {
          $push: {
            packages: { name: name, version: version }
          }
        }, { session })

    return r.modifiedCount
  }

  private async importBucket(name: string, mode: BUCKET_ACL, session: ClientSession) {
    const db = DatabaseAgent.sys_accessor.db

    // check bucket name exists
    const [existed] = (this.app.buckets || []).filter(bk => bk.name === name)
    if (existed) return

    const oss = await MinioAgent.New()
    const internalName = `${this.app.appid}-${name}`
    const ret = await oss.createBucket(internalName, { acl: mode })
    if (!ret) {
      throw new Error(`Failed to create bucket: ${name}`)
    }

    // add to app
    await db.collection<ApplicationStruct>(Constants.colls.applications)
      .updateOne({ appid: this.app.appid }, {
        $push: {
          buckets: { name, mode }
        }
      }, { session })
  }

  private async importCollection(coll: CollectionStructure) {
    const accessor = await getApplicationDbAccessor(this.app)
    const db = accessor.db

    const collections = await db.listCollections()
      .toArray()

    const existed = collections.filter(c => c.name === coll.name)
    if (existed.length) return

    await db.createCollection(coll.name, coll.options)
    await db.collection(coll.name).createIndexes(coll.indexes)

    await accessor.close()
  }
}
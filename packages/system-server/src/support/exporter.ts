import { IApplicationData, getApplicationDbAccessor } from "./application"
import { ICloudFunctionData } from "./function"
import { IPolicyData } from "./policy"
import { CN_FUNCTIONS, CN_POLICIES } from "../constants"
import { DatabaseAgent } from "../db"
import * as AdmZip from 'adm-zip'


/**
 * Export application definition to json object:
 * - cloud functions
 * - policies
 */
export class ApplicationExporter {
  readonly version = '1.0'
  readonly app: IApplicationData
  readonly zip: AdmZip

  constructor(app: IApplicationData) {
    this.app = app
    this.zip = new AdmZip()
  }

  async build() {
    this.buildMeta()
    await this.buildFunctions()
    await this.buildPolicies()
    await this.buildCollections()

    return this.zip
  }

  public buildMeta() {
    const data = {
      name: this.app.name,
      buckets: this.app.buckets || [],
      packages: this.app.packages || [],
      created_at: new Date(),
      version: this.version
    }

    this.zip.addFile('app.json', this.json2buffer(data))
  }

  public async buildFunctions() {
    const db = DatabaseAgent.db
    const docs = await db.collection<ICloudFunctionData>(CN_FUNCTIONS)
      .find({ appid: this.app.appid })
      .toArray()

    for (const func of docs) {
      const meta = {
        name: func.name,
        label: func.label,
        hash: func.hash,
        tags: func.tags,
        description: func.description,
        enableHTTP: func.enableHTTP,
        status: func.status,
        triggers: func.triggers,
        debugParams: func.debugParams,
        version: func.version
      }

      this.zip.addFile(`functions/${func.name}/meta.json`, this.json2buffer(meta))
      this.zip.addFile(`functions/${func.name}/index.ts`, Buffer.from(func.code))
    }
  }

  public async buildPolicies() {
    const db = DatabaseAgent.db
    const docs = await db.collection<IPolicyData>(CN_POLICIES)
      .find({ appid: this.app.appid })
      .toArray()

    for (const po of docs) {
      const data = {
        name: po.name,
        description: po.description,
        status: po.status,
        rules: po.rules,
        injector: po.injector ?? null,
        hash: po.hash,
      }

      this.zip.addFile(`policies/${po.name}.json`, this.json2buffer(data))
    }
  }

  public async buildCollections() {
    const accessor = await getApplicationDbAccessor(this.app)
    const docs = await accessor.db.listCollections().toArray()

    for (const co of docs) {
      if (co.name.startsWith('__')) continue
      if (co.name.endsWith('.files')) continue
      if (co.name.endsWith('.chunks')) continue

      const data = {
        name: co.name,
        options: (co as any).options,
        indexes: await accessor.db.collection(co.name).indexes()
      }

      this.zip.addFile(`collections/${co.name}.json`, this.json2buffer(data))
    }

    await accessor.close()
  }

  private json2buffer(data: Object) {
    return Buffer.from(JSON.stringify(data))
  }
}
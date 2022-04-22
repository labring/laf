import { CN_APP_SPECS, CN_SPECS } from "../constants"
import { DatabaseAgent } from "../db"
import * as assert from 'assert'

/**
 * Spec data structure in database
 */
export interface ISpecData {
  /** unique name */
  name: string
  /** display name */
  label: string
  /** max cpu, in units, 1 core equal to 1000 unit */
  limit_cpu: number
  /** max raw memory, in bytes */
  limit_memory: number
  /** min cpu, in units */
  request_cpu: number
  /** min raw memory, in bytes */
  request_memory: number
  /** database capacity size, in bytes */
  database_capacity: number
  /** object storage capacity size, in bytes */
  storage_capacity: number
  /** bandwith, in bytes */
  bandwith: number
  /** out traffic quota, in bytes */
  out_traffic: number
  priority: number
  enabled: boolean
  created_at?: Date
  updated_at?: Date
}

/**
 * Database struct of specs assigned to app
 */
export interface IAppSpecData {
  /** appid */
  appid: string
  /** valid from time */
  start_at: Date
  /** valid to time */
  end_at: Date
  /** valid control */
  enabled: boolean
  spec: ISpecData
  created_at?: Date
  updated_at?: Date
}

/**
 * Application Specs
 */
export class ApplicationSpecSupport {

  /**
   * Get enabled app spec by appid
   * @param appid 
   * @returns 
   */
  public static async getValidAppSpec(appid: string) {
    const db = DatabaseAgent.db
    const app_spec = await db.collection<IAppSpecData>(CN_APP_SPECS)
      .findOne({
        appid,
        enabled: true,
        start_at: { $lte: new Date() },
        end_at: { $gt: new Date() }
      }, { sort: ['spec.priority', 'desc'] })


    return app_spec
  }

  /**
   * Assign spec to app
   * @param app_spec 
   */
  public static async assign(appid: string, spec_name: string, start: Date, end: Date) {
    const spec = await this.getSpec(spec_name)
    assert.ok(spec, `spec not found with name: ${spec_name}`)

    const db = DatabaseAgent.db
    const data: IAppSpecData = {
      appid,
      start_at: start,
      end_at: end,
      enabled: true,
      spec: spec,
      created_at: new Date(),
      updated_at: new Date()
    }
    const res = await db.collection<IAppSpecData>(CN_APP_SPECS)
      .insertOne(data)

    return res
  }

  /**
   * List application specs
   * @returns 
   */
  public static async listSpecs() {
    const db = DatabaseAgent.db
    const docs = await db.collection<ISpecData>(CN_SPECS)
      .find()
      .toArray()

    return docs
  }

  /**
   * Get a application spec by name
   * @param name 
   * @returns 
   */
  public static async getSpec(name: string) {
    const db = DatabaseAgent.db
    const doc = await db.collection<ISpecData>(CN_SPECS)
      .findOne({ name })

    return doc
  }

  /**
   * Create an application spec
   * @param spec 
   * @returns 
   */
  public static async createSpec(spec: ISpecData) {
    const db = DatabaseAgent.db
    const data: ISpecData = {
      ...spec,
      created_at: new Date(),
      updated_at: new Date()
    }
    const res = await db.collection<ApplicationSpecSupport>(CN_SPECS)
      .insertOne(data)

    return res
  }

  /**
   * Delete an spec by name
   * @param name 
   * @returns 
   */
  public static async deleteSpec(name: string) {
    const db = DatabaseAgent.db
    const res = await db.collection<ISpecData>(CN_SPECS)
      .deleteOne({ name })

    return res
  }
}
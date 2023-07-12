import { ICloudFunctionData, FunctionContext, FunctionResult } from './types'
import * as assert from 'assert'
import { DatabaseAgent } from '../../db'
import { CLOUD_FUNCTION_COLLECTION } from '../../constants'
import { FunctionCache } from './cache'
import { FunctionEngine } from '.'

/**
 * CloudFunction Class
 */
export class CloudFunction {
  /**
   * object shared cross all functions & requests
   */
  static _shared_preference = new Map<string, any>()

  /**
   * execution timeout
   */
  timeout = 60 * 1000

  /**
   * function data struct
   */
  protected _data: ICloudFunctionData

  /**
   * function context
   */
  param: FunctionContext

  /**
   * execution result
   */
  result: FunctionResult

  get id() {
    return this._data.id
  }

  /**
   * function name
   */
  get name() {
    return this._data.name
  }

  /**
   * Http enabled status
   */
  get methods() {
    return this._data.methods || []
  }

  /**
   * function code
   */
  get code() {
    return this._data.source.code
  }

  /**
   * compiled code
   */
  get compiledCode() {
    return this._data.source.compiled
  }

  constructor(data: ICloudFunctionData) {
    assert.ok(data)
    this._data = data
  }

  /**
   * invoke the function
   * @param param
   * @returns
   */
  async invoke(param: FunctionContext) {
    this.param = param

    const engine = new FunctionEngine(
      this._data.source.compiled,
      FunctionCache.requireFunc,
    )

    this.result = await engine.run(param, {
      filename: `CloudFunction.${this.name}`,
      timeout: this.timeout,
      displayErrors: true,
      contextCodeGeneration: {
        strings: false,
      },
    } as any)

    return this.result
  }

  /**
   * Gets the cloud function by function name
   * @param func_name
   * @returns
   */
  static getFunctionByName(func_name: string) {
    return FunctionCache.getFunctionByName(func_name)
  }

  /**
   * Get the cloud function by function id
   * @param func_id
   * @returns
   */
  static async getFunctionById(func_id: string) {
    const db = DatabaseAgent.db

    const doc = await db
      .collection<ICloudFunctionData>(CLOUD_FUNCTION_COLLECTION)
      .findOne({
        // _id: new ObjectId(func_id)
        id: func_id,
      })

    return doc
  }
}

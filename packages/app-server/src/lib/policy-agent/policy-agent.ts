import assert = require("assert")
import { AccessorInterface, Policy } from "less-api"
import { CloudFunction } from "../../../../cloud-function-engine/dist"
import { getFunctionByName } from "../../api/function"
import { Globals } from "../globals/globals"
import { InjectionGetter, PolicyAgentInterface, PolicyComposition, PolicyDataStruct } from "./types"

const logger = Globals.logger

/**
 * 管理多个 policy, 初始化 injector
 */
export class PolicyAgent implements PolicyAgentInterface {
  private _accessor: AccessorInterface
  private _data: Map<string, PolicyComposition> = new Map()

  constructor(accessor: AccessorInterface) {
    assert(accessor, 'accessor cannot be empty')
    this._accessor = accessor
  }

  async set(name: string, data: PolicyDataStruct) {
    assert(data, 'policy data cannot be empty')

    const policy = new Policy(this._accessor)
    policy.load(data.rules)

    const injector_func = await this.getInjector(data.injector)

    this._data.set(name, { name, policy, injector_func })
  }

  get(name: string) {
    return this._data.get(name)
  }


  clear() {
    this._data.clear()
  }

  private async getInjector(injectorName: string): Promise<InjectionGetter> {
    if (!injectorName) {
      return defaultInjectionGetter
    }

    try {
      const func_data = await getFunctionByName(injectorName)
      assert.ok(func_data, 'getFunctionByName(): function not found')

      const func = new CloudFunction(func_data)
      const ret = await func.invoke({})
      assert(typeof ret.data === 'function', 'function type needed')

      return ret.data
      
    } catch (error) {
      logger.error(`failed to get injector by cloud function: ${injectorName}, now using default injector`, error)
      return defaultInjectionGetter
    }    
  }
}

/**
 * 默认的 injection getter
 * @param uid 
 * @returns 返回默认的 injections
 */
async function defaultInjectionGetter(uid: string) {
  return {
    $uid: uid
  }
}
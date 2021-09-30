
import { Params } from '../types'
import { Handler, Processor } from '../processor'
import { AccessorInterface } from '../accessor'

// Permission Rule
export interface PermissionRule {
  [name: string]: Processor
}

// Validate Error Struct
export interface ValidateError {
  type: string | number,
  error: string | object
}

// Validate Result Struct
export interface ValidateResult {
  errors?: ValidateError[],
  matched?: PermissionRule
}

/**
 * Ruler Interface
 */
export interface PolicyInterface {
  /**
   * collection names in rules
   * @readonly
   */
  collections: string[]

  /**
   * accessor
   * @readonly
   */
  accessor: AccessorInterface

  /**
   * load all rules
   * @param rules json object roles
   */
  load(rules: any): boolean

  /**
   * validate the request params
   * @param params 
   * @param injections 
   */
  validate(params: Params, injections: object): Promise<ValidateResult>

  /**
   * register a validator for using in rules
   * @param name 
   * @param handler 
   */
  register(name: string, handler: Handler): void
}
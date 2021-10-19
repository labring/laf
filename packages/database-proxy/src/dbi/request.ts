
import { Proxy } from "../proxy"
import { RequestInterface } from 'database-ql'
import { AccessorInterface } from ".."
import { QueryParam, ResponseStruct } from "database-ql/dist/commonjs/interface"
import { ActionType } from "database-ql/dist/commonjs/constant"

export class Request implements RequestInterface {

  private accessor: AccessorInterface

  constructor(accessor: AccessorInterface) {
    this.accessor = accessor
  }

  async send(action: ActionType, data: QueryParam): Promise<ResponseStruct> {
    const accessor = this.accessor
    const params = Proxy.parse(action as any, data)
    const ret = await accessor.execute(params)

    return {
      code: 0,
      data: ret,
      error: undefined,
      requestId: undefined
    }
  }
}
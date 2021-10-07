import { ActionType } from "../types"
import { Proxy } from "../proxy"
import { RequestInterface } from 'database-ql'
import { AccessorInterface } from ".."

export class Request implements RequestInterface {

  private accessor: AccessorInterface

  constructor(accessor: AccessorInterface) {
    this.accessor = accessor
  }

  async send(action: ActionType, data: any): Promise<any> {
    const accessor = this.accessor
    const params = Proxy.parse(action, data)
    const ret = await accessor.execute(params)
    // 解决 mongodb _id 对象字符串问题
    const _data = JSON.parse(JSON.stringify(ret))

    return {
      code: 0,
      data: _data
    }
  }
}